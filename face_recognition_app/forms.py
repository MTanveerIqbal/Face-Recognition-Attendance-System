from django import forms

class AttendanceForm(forms.Form):
    student_id = forms.CharField(max_length=10)