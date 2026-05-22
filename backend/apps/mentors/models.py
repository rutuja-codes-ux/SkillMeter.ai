from django.db import models
from django.contrib.auth.models import User

class MentorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    skills = models.JSONField(default=list) # e.g. ["Python", "ML", "Deep Learning"]
    hourly_rate_inr = models.IntegerField(default=0) # e.g. 500 (or 0 for Free)
    rating = models.FloatField(default=5.0)
    total_sessions = models.IntegerField(default=0)
    is_trending = models.BooleanField(default=False)
    avatar_url = models.URLField(max_length=500, blank=True, default='')

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.title} at {self.company})"
