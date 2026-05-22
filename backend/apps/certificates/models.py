import uuid
from django.db import models
from apps.users.models import UserProfile

class Certificate(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='certificates')
    course_title = models.CharField(max_length=300)
    certificate_id = models.UUIDField(default=uuid.uuid4, unique=True)
    pdf_url = models.URLField(max_length=500, blank=True, default='')
    issued_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Certificate of {self.user.user.username} - {self.course_title}"
