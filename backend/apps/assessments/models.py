from django.db import models
from apps.users.models import UserProfile

class AssessmentResult(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='assessments')
    quiz_topic = models.CharField(max_length=200)
    score = models.IntegerField()
    total_questions = models.IntegerField(default=5)
    taken_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.user.username} scored {self.score}/{self.total_questions} in {self.quiz_topic}"
