from django.db import models
from apps.users.models import UserProfile

class Roadmap(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='roadmaps')
    title = models.CharField(max_length=300)
    goal = models.TextField()
    skill_level = models.CharField(max_length=50)
    total_weeks = models.IntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)
    # This JSONField replicates the MongoDB roadmaps document structure!
    # Schema:
    # [
    #   {
    #     "phase_number": 1,
    #     "title": "Phase title",
    #     "description": "What learner will achieve",
    #     "subtopics": [
    #       {
    #         "id": "subtopic_uuid",
    #         "title": "Topic title",
    #         "estimated_hours": 3,
    #         "status": "not_started" | "in_progress" | "completed",
    #         "videos": [
    #           {
    #             "video_id": "youtube_id",
    #             "title": "video title",
    #             "channel": "channel name",
    #             "thumbnail": "thumbnail_url",
    #             "watched": false
    #           }
    #         ]
    #       }
    #     ]
    #   }
    # ]
    phases = models.JSONField(default=list)

    def __str__(self):
        return f"Roadmap for {self.user.user.username}: {self.title}"
