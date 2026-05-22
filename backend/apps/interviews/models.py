from django.db import models
from apps.users.models import UserProfile

class MockInterview(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='interviews')
    topic = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    questions = models.JSONField(default=list) # e.g. [{"id": 1, "question": "..."}]
    responses = models.JSONField(default=list) # e.g. [{"question_id": 1, "answer": "...", "score": 8, "feedback": "..."}]
    overall_score = models.FloatField(default=0.0)
    feedback = models.TextField(blank=True, default='')
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.user.username} - {self.topic} ({self.difficulty})"
