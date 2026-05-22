from django.db import models
from apps.users.models import UserProfile
from apps.roadmaps.models import Roadmap

class CourseEnrollment(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='enrollments')
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='enrollments')
    # Stored as text if we want compatibility with MongoDB style, but we map it to ForeignKey.
    # We also keep course_id property.
    enrolled_at = models.DateTimeField(auto_now_add=True)
    progress_percent = models.FloatField(default=0.0)
    completed_at = models.DateTimeField(null=True, blank=True)

    @property
    def course_id(self):
        return str(self.roadmap.id)

    def __str__(self):
        return f"{self.user.user.username} enrolled in {self.roadmap.title}"
