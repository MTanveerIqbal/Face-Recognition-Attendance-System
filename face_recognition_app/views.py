from django.shortcuts import render, redirect
from django.contrib import messages
import os
from django.views.decorators.csrf import csrf_exempt
from .models import Student, Attendance
from .forms import AttendanceForm
import logging
import traceback
import cv2
import numpy as np
import base64
from django.conf import settings
from django.http import JsonResponse

logger = logging.getLogger(__name__)

# Try to import dependencies, otherwise fallback
try:
    import mediapipe as mp
    from scipy.spatial import distance as dist
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    logger.warning("MediaPipe or Scipy not found. Please install: pip install mediapipe scipy")

# Global cache to store student face embeddings
# Format: {student_id: matching_embedding}
STUDENT_EMBEDDINGS_CACHE = {}

class MediaPipeFaceMatcher:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )

    def get_face_embedding(self, image):
        """
        Extracts a geometrically normalized feature vector from a face.
        Robust to position (translation) and distance (scale).
        """
        # Safety check if initialization failed
        if not hasattr(self, 'face_mesh'):
            logger.error("MediaPipe FaceMesh not initialized properly.")
            return None

        try:
            results = self.face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            if not results.multi_face_landmarks:
                return None
            
            # Get the first face
            landmarks = results.multi_face_landmarks[0].landmark
            
            # Convert to numpy array
            points = np.array([[l.x, l.y, l.z] for l in landmarks])
            
            # 1. Translation Invariance: Center at the nose tip (index 1)
            # Or better, centroid of all points
            centroid = np.mean(points, axis=0)
            centered = points - centroid
            
            # 2. Scale Invariance: Scale by the standard deviation or max distance
            # Using max distance from centroid is robust
            max_dist = np.max(np.linalg.norm(centered, axis=1))
            if max_dist > 0:
                normalized = centered / max_dist
            else:
                normalized = centered
                
            # Flatten to 1D vector
            embedding = normalized.flatten()
            return embedding
        except Exception as e:
            logger.error(f"Error in embedding generation: {e}")
            return None

    def compare_faces(self, embedding1, embedding2, threshold=0.15):
        """
        Calculates distance between two normalized face embeddings.
        Returns True if distance < threshold.
        """
        if embedding1 is None or embedding2 is None:
            return False, 1.0
            
        # Cosine distance is good for shape similarity
        d = dist.cosine(embedding1, embedding2)
        
        # Log distance for debugging
        logger.info(f"Face Distance: {d:.4f} (Threshold: {threshold})")
        
        return d < threshold, d

# Initialize matcher if libraries are available
face_matcher = MediaPipeFaceMatcher() if MEDIAPIPE_AVAILABLE else None

def index(request):
    try:
        if request.method == 'POST':
            student_id = request.POST.get('student_id', '').strip()
            logger.debug(f"Processing student ID: {student_id}")
            
            if not student_id:
                raise ValueError("Empty student ID")
            
            student = Student.objects.get(student_id=student_id)
            logger.info(f"Student found: {student.name}")
            form = AttendanceForm(initial={'student_id': student.student_id})
            return render(request, 'attendance.html', {'student': student, 'form': form})
            
        return render(request, 'index.html')
    
    except Student.DoesNotExist:
        logger.error("Student ID not found in database")
        messages.error(request, 'Student ID not found')
    except Exception as e:
        logger.error(f"Index Error: {str(e)}\n{traceback.format_exc()}")
        messages.error(request, 'System error occurred')
    return render(request, 'index.html')

@csrf_exempt
def mark_attendance(request):
    try:
        if request.method == 'POST':
            form = AttendanceForm(request.POST)
            if form.is_valid():
                logger.debug("Starting attendance marking process")
                student_id = form.cleaned_data['student_id']
                
                student = Student.objects.get(student_id=student_id)
                logger.debug(f"Processing student: {student.name}")
                
                # Get the image data from the request (sent as base64)
                data = request.POST.get('image')
                if not data:
                    logger.error("No image data received")
                    return JsonResponse({'error': 'No image data received'}, status=400)

                # Decode the base64 image
                image_data = base64.b64decode(data.split(',')[1])  # Remove "data:image/jpeg;base64," prefix
                nparr = np.frombuffer(image_data, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                # Temporary file handling
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
                os.makedirs(temp_dir, exist_ok=True)
                temp_path = os.path.join(temp_dir, 'current_selfie.jpg')

                # Save the captured image temporarily
                try:
                    cv2.imwrite(temp_path, image)
                    logger.debug(f"Selfie saved to: {temp_path}")
                except Exception as e:
                    logger.error(f"Failed to save selfie: {str(e)}")
                    return JsonResponse({'error': 'Failed to process captured image'}, status=500)

                # Face recognition process
                try:
                    logger.debug("Loading registered face")
                    known_image = face_recognition.load_image_file(student.face_image.path)
                    known_encodings = face_recognition.face_encodings(known_image)
                    
                    if not known_encodings:
                        logger.error("No face detected in registered image")
                        raise ValueError("No face detected in registered image")
                    known_encoding = known_encodings[0]
                    
                    logger.debug("Processing selfie")
                    unknown_image = face_recognition.load_image_file(temp_path)
                    unknown_encodings = face_recognition.face_encodings(unknown_image)
                    
                    if not unknown_encodings:
                        logger.error("No face detected in selfie")
                        raise ValueError("No face detected in selfie")
                    unknown_encoding = unknown_encodings[0]
                    
                    # Compare faces with adjusted tolerance
                    match = face_recognition.compare_faces(
                        [known_encoding],
                        unknown_encoding,
                        tolerance=0.5
                    )[0]
                    
                    if match:
                        logger.info(f"Face match successful for {student.name}")
                        Attendance.objects.create(student=student)
                        messages.success(request, f'Attendance marked for {student.name}!')
                        logger.debug("Attendance record created in database")
                        return JsonResponse({'status': 'success', 'message': f'Attendance marked for {student.name}!'})
                    else:
                        logger.warning("Face mismatch detected")
                        messages.error(request, 'Face verification failed')
                        return JsonResponse({'error': 'Face verification failed'}, status=400)
                    
                except Exception as e:
                    logger.error(f"Face processing error: {str(e)}\n{traceback.format_exc()}")
                    return JsonResponse({'error': f'Error processing images: {str(e)}'}, status=500)
                
                finally:
                    # Cleanup temporary files
                    if os.path.exists(temp_path):
                        try:
                            os.remove(temp_path)
                            logger.debug("Temporary file removed")
                        except Exception as e:
                            logger.error(f"Failed to remove temporary file: {str(e)}")
            else:
                logger.error(f"Invalid form submission: {form.errors}")
                return JsonResponse({'error': f'Invalid form submission: {form.errors}'}, status=400)
        
        # Handle non-POST requests
        logger.warning("Non-POST request to mark_attendance")
        messages.error(request, "Invalid request method")
        return redirect('index')
    
    except Student.DoesNotExist:
        logger.error(f"Student ID {student_id} not found")
        messages.error(request, 'Student not found')
        return redirect('index')
    except Exception as e:
        logger.critical(f"System failure: {str(e)}\n{traceback.format_exc()}")
        return JsonResponse({'error': f'Critical system error: {str(e)}'}, status=500)


# =============================================================================
# REST API ENDPOINTS FOR REACT FRONTEND
# =============================================================================

def get_student(request, student_id):
    """API endpoint to fetch student details by ID"""
    try:
        student = Student.objects.get(student_id=student_id)
        return JsonResponse({
            'status': 'success',
            'student': {
                'id': student.id,
                'student_id': student.student_id,
                'name': student.name,
                'face_image_url': student.face_image.url if student.face_image else None
            }
        })
    except Student.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'error': 'Student not found'
        }, status=404)
    except Exception as e:
        logger.error(f"API Error in get_student: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'error': 'Server error occurred'
        }, status=500)


@csrf_exempt
def mark_attendance_api(request):
    """API endpoint for marking attendance with face verification"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        import json
        
        # Parse JSON body or form data
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            student_id = data.get('student_id')
            image_data = data.get('image')
        else:
            student_id = request.POST.get('student_id')
            image_data = request.POST.get('image')
        
        if not student_id:
            return JsonResponse({'error': 'Student ID is required'}, status=400)
        
        if not image_data:
            return JsonResponse({'error': 'Image data is required'}, status=400)
        
        # Get student
        try:
            student = Student.objects.get(student_id=student_id)
        except Student.DoesNotExist:
            return JsonResponse({'error': 'Student not found'}, status=404)
        
        # Decode base64 image
        try:
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            decoded_image = base64.b64decode(image_data)
            nparr = np.frombuffer(decoded_image, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return JsonResponse({'error': 'Invalid image data'}, status=400)
        except Exception as e:
            logger.error(f"Image decode error: {str(e)}")
            return JsonResponse({'error': 'Failed to decode image'}, status=400)
        
        # Save temporary file for face recognition
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f'selfie_{student_id}.jpg')
        
        try:
            cv2.imwrite(temp_path, image)
            
            # Load and encode known face
            known_image = face_recognition.load_image_file(student.face_image.path)
            known_encodings = face_recognition.face_encodings(known_image)
            
            if not known_encodings:
                return JsonResponse({
                    'error': 'No face detected in registered image. Please contact admin.'
                }, status=400)
            
            # Load and encode captured face
            unknown_image = face_recognition.load_image_file(temp_path)
            unknown_encodings = face_recognition.face_encodings(unknown_image)
            
            if not unknown_encodings:
                return JsonResponse({
                    'error': 'No face detected in captured image. Please try again.'
                }, status=400)
            
            # Compare faces
            match = face_recognition.compare_faces(
                [known_encodings[0]],
                unknown_encodings[0],
                tolerance=0.5
            )[0]
            
            # Calculate face distance for confidence score
            face_distance = face_recognition.face_distance(
                [known_encodings[0]],
                unknown_encodings[0]
            )[0]
            confidence = round((1 - face_distance) * 100, 2)
            
            if match:
                Attendance.objects.create(student=student)
                logger.info(f"Attendance marked for {student.name} via API")
                return JsonResponse({
                    'status': 'success',
                    'message': f'Attendance marked successfully for {student.name}!',
                    'confidence': confidence
                })
            else:
                return JsonResponse({
                    'status': 'error',
                    'error': 'Face verification failed. Please try again.',
                    'confidence': confidence
                }, status=400)
                
        finally:
            # Cleanup
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception as e:
                    logger.error(f"Failed to remove temp file: {str(e)}")
                    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        logger.critical(f"API Error: {str(e)}\n{traceback.format_exc()}")
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


def get_attendance_records(request, student_id=None):
    """API endpoint to get attendance records"""
    try:
        if student_id:
            student = Student.objects.get(student_id=student_id)
            records = Attendance.objects.filter(student=student).order_by('-date')[:20]
        else:
            records = Attendance.objects.all().order_by('-date')[:50]
        
        return JsonResponse({
            'status': 'success',
            'records': [
                {
                    'id': r.id,
                    'student_name': r.student.name,
                    'student_id': r.student.student_id,
                    'date': r.date.isoformat()
                }
                for r in records
            ]
        })
    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)
    except Exception as e:
        logger.error(f"API Error in get_attendance_records: {str(e)}")

@csrf_exempt
def recognize_face_api(request):
    """API endpoint for real-time face identification using MediaPipe"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Check if MediaPipe is ready
    if not face_matcher:
        return JsonResponse({'error': 'Face recognition engine (MediaPipe) not initialized'}, status=503)

    try:
        import json
        
        # Parse image data
        if request.content_type == 'application/json':
            data = json.loads(request.body)
            image_data = data.get('image')
        else:
            image_data = request.POST.get('image')
        
        if not image_data:
            return JsonResponse({'error': 'Image data is required'}, status=400)
            
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        decoded_image = base64.b64decode(image_data)
        nparr = np.frombuffer(decoded_image, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 1. Get embedding for the input frame
        unknown_embedding = face_matcher.get_face_embedding(image)
        if unknown_embedding is None:
            return JsonResponse({'status': 'success', 'match': False})

        # 2. Iterate through students to find a match
        # Optimization: Lazy load embeddings into cache
        students = Student.objects.all()
        
        best_match = None
        min_dist = 1.0
        
        for student in students:
            if not student.face_image:
                continue
                
            # Check cache first
            if student.id not in STUDENT_EMBEDDINGS_CACHE:
                try:
                    # Load student image from disk
                    # Using opencv to read the file path directly
                    # Note: face_image.path might be absolute on server
                    student_img = cv2.imread(student.face_image.path)
                    if student_img is None:
                        continue
                        
                    embedding = face_matcher.get_face_embedding(student_img)
                    if embedding is not None:
                        STUDENT_EMBEDDINGS_CACHE[student.id] = embedding
                    else:
                        # Could not detect face in stored image
                        continue
                except Exception as e:
                    logger.error(f"Error processing student {student.id}: {e}")
                    continue
            
            # Compare
            if student.id in STUDENT_EMBEDDINGS_CACHE:
                cached_emb = STUDENT_EMBEDDINGS_CACHE[student.id]
                match, dist = face_matcher.compare_faces(
                    cached_emb, 
                    unknown_embedding,
                    threshold=0.20 # Increased threshold slightly for better recall
                )
                
                print(f"DEBUG: Comparing with {student.name} (ID: {student.student_id}) - Distance: {dist:.4f} - Match: {match}")
                
                if match:
                    # Found a potential match, keep the best one
                    if dist < min_dist:
                        min_dist = dist
                        best_match = student
        
        if best_match:
            print(f"DEBUG: Best match found: {best_match.name} with confidence {1-min_dist:.4f}")
            # Record attendance
            from django.utils import timezone
            import datetime
            
            # Rate limit: Don't mark twice in 1 minute
            # existing = Attendance.objects.filter(
            #     student=best_match, 
            #     date__gte=timezone.now() - datetime.timedelta(minutes=1)
            # ).exists()
            
            # if not existing:
            Attendance.objects.create(student=best_match)
                
            return JsonResponse({
                'status': 'success',
                'match': True,
                'student': {
                    'id': best_match.id,
                    'name': best_match.name,
                    'student_id': best_match.student_id,
                    'face_image_url': best_match.face_image.url
                },
                'confidence': float(1 - min_dist)
            })
            
        return JsonResponse({'status': 'success', 'match': False})

    except Exception as e:
        logger.error(f"Recognition API Error: {str(e)}")
        # trace = traceback.format_exc()
        # logger.error(trace)
        return JsonResponse({'error': str(e)}, status=500)
