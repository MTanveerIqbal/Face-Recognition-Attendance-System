# 🎯 Face Recognition Attendance System

A modern, professional attendance management system using AI-powered facial recognition. Built with Django backend and React.js frontend featuring stunning animations and a premium glassmorphism design.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Django](https://img.shields.io/badge/Django-4.2-green.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **🔐 Secure Face Recognition** - AI-powered facial verification using **Google MediaPipe**
- **⚡ Real-time Processing** - Instant geometric face matching with robust position handling
- **🎨 Premium UI/UX** - Glassmorphism design with smooth Framer Motion animations
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🌙 Modern Aesthetics** - Gradient backgrounds, floating particles, micro-interactions
- **📊 Admin Dashboard** - Django admin for managing students and attendance records

## 🛠️ Technology Stack

### Backend
- **Django 4.2** - Python web framework
- **SQLite** - Database (easily upgradable to PostgreSQL)
- **Google MediaPipe** - High-fidelity face geometry & embedding generation
- **SciPy** - Spatial distance calculation for matching
- **OpenCV** - Image processing
- **django-cors-headers** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Framer Motion** - Animations
- **React Router** - Client-side routing
- **react-webcam** - Camera integration

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn
- Webcam (for face recognition)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/attendance-face-recognition.git
cd "Attendance Management System using Face Recognition"
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv env
.\env\Scripts\activate  # Windows
# source env/bin/activate  # Linux/Mac

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Run database migrations
python manage.py migrate

# Create admin superuser
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Usage

### Development Mode

1. **Start Backend** (Terminal 1):
   ```bash
   .\env\Scripts\activate
   python manage.py runserver
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://127.0.0.1:8000
   - Admin Panel: http://127.0.0.1:8000/admin

### Adding Students

1. Go to Django Admin: http://127.0.0.1:8000/admin
2. Login with superuser credentials
3. Click "Students" → "Add Student"
4. Enter Student ID, Name, and upload a clear face photo
5. Save the student

### Marking Attendance

1. Open http://localhost:5173
2. Enter your Student ID
3. Allow camera access
4. Position your face in the frame
5. Click the capture button
6. Click "Mark Attendance" to verify

## 📁 Project Structure

```
Attendance Management System using Face Recognition/
├── attendance/                 # Django project settings
│   ├── settings.py            # Configuration
│   ├── urls.py                # URL routing
│   └── wsgi.py                # WSGI config
├── face_recognition_app/       # Main Django app
│   ├── models.py              # Student & Attendance models
│   ├── views.py               # API endpoints
│   ├── urls.py                # App URL routes
│   ├── admin.py               # Admin configuration
│   └── templates/             # Legacy HTML templates
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── App.jsx            # Main app component
│   │   └── index.css          # Global styles
│   ├── package.json           # Node dependencies
│   └── vite.config.js         # Vite configuration
├── media/                      # Uploaded face images
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/<id>/` | Get student details |
| POST | `/api/attendance/` | Mark attendance with face verification |
| GET | `/api/attendance/records/` | Get all attendance records |
| GET | `/api/attendance/records/<id>/` | Get student's attendance |

## ⚙️ Configuration

### Environment Variables (.env)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
FACE_MATCH_TOLERANCE=0.5
```

### Face Recognition Tolerance

Adjust `FACE_MATCH_TOLERANCE` in `.env`:
- Lower values (0.10) = Stricter matching
- Higher values (0.30) = More lenient matching
- Default: 0.20 (Optimized for MediaPipe)

### Troubleshooting Dependencies
If you encounter `AttributeError: module 'mediapipe' has no attribute 'solutions'`, it is a version conflict. Run:
```bash
pip install "protobuf<4"
```

## 🏗️ Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Django Production Settings
1. Set `DEBUG=False` in `.env`
2. Generate a new `SECRET_KEY`
3. Configure `ALLOWED_HOSTS`
4. Set up proper database (PostgreSQL recommended)
5. Configure static file serving

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google MediaPipe](https://developers.google.com/mediapipe) - Face detection and recognition engine
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Vite](https://vitejs.dev/) - Frontend build tool

---

<p align="center">
  Made with ❤️ for modern attendance management
</p>
