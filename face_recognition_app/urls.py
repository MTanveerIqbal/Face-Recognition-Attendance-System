from django.urls import path
from . import views

urlpatterns = [
    # Template-based views (legacy)
    path('', views.index, name='index'),
    path('attendance/', views.mark_attendance, name='attendance'),
    
    # REST API endpoints for React frontend
    path('api/student/<str:student_id>/', views.get_student, name='api_get_student'),
    path('api/attendance/', views.mark_attendance_api, name='api_mark_attendance'),
    path('api/attendance/recognize/', views.recognize_face_api, name='api_recognize_face'),
    path('api/attendance/records/', views.get_attendance_records, name='api_attendance_records'),
    path('api/attendance/records/<str:student_id>/', views.get_attendance_records, name='api_student_attendance'),
]