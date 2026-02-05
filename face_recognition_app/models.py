from django.db import models

class Student(models.Model):
    student_id = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    face_image = models.ImageField(upload_to='known_faces/')

    def __str__(self):
        return f"{self.name} ({self.student_id})"

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.date.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        verbose_name = "Attendance Record"
        verbose_name_plural = "Attendance Records"