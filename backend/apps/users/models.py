from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    SKILL_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    learning_goal = models.CharField(max_length=300, blank=True)
    skill_level = models.CharField(max_length=20, choices=SKILL_LEVELS, default='beginner')
    available_hours_per_week = models.IntegerField(default=5)
    streak_days = models.IntegerField(default=0)
    best_streak = models.IntegerField(default=0)
    xp_points = models.IntegerField(default=0)
    badge_count = models.IntegerField(default=0)
    last_active = models.DateTimeField(auto_now=True)
    avatar_url = models.URLField(max_length=500, blank=True, default='')

    def __str__(self):
        return f"Profile of {self.user.username}"
