from django.contrib import admin
from django.utils.timezone import localtime
from .models import Student, Attendance

class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'formatted_date', 'student_id')
    list_filter = ('date',)
    search_fields = ('student__name', 'student_id')

    def formatted_date(self, obj):
        return localtime(obj.date).strftime("%Y-%m-%d %H:%M")
    formatted_date.short_description = 'Date & Time'
    
    def student_id(self, obj):
        return obj.student.student_id
    student_id.short_description = 'Student ID'

admin.site.register(Student)
admin.site.register(Attendance, AttendanceAdmin)