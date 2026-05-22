from django.db import models
from apps.users.models import UserProfile

class DailyProgress(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='daily_progress')
    date = models.DateField()
    minutes_studied = models.IntegerField(default=0)
    concepts_completed = models.IntegerField(default=0)
    videos_watched = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'date')

    def __str__(self):
        return f"{self.user.user.username} - {self.date}: {self.minutes_studied} min"
