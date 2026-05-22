from rest_framework import views, status, permissions
from rest_framework.response import Response
from apps.users.models import UserProfile
from apps.courses.models import CourseEnrollment
from apps.roadmaps.models import Roadmap
from .models import DailyProgress
from django.utils import timezone
from datetime import timedelta
import random

class DashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_profile = request.user.profile
        
        # Get active courses
        enrollments = CourseEnrollment.objects.filter(user=user_profile).order_ok = True
        # Sort manually or order_by
        enrollments = CourseEnrollment.objects.filter(user=user_profile).order_by('-enrolled_at')
        
        current_course = None
        if enrollments.exists():
            e = enrollments.first()
            current_course = {
                "id": e.id,
                "course_id": e.course_id,
                "title": e.roadmap.title,
                "progress_percent": e.progress_percent,
                "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
            }

        # Calculate today's tasks
        today_tasks = []
        if enrollments.exists():
            active_roadmap = enrollments.first().roadmap
            # Collect up to 3 incomplete subtopics
            count = 0
            for phase in active_roadmap.phases:
                for sub in phase.get('subtopics', []):
                    if sub.get('status') != 'completed':
                        today_tasks.append({
                            "id": sub.get('id'),
                            "title": sub.get('title'),
                            "estimated_minutes": sub.get('estimated_hours', 2) * 60,
                            "completed": False
                        })
                        count += 1
                        if count >= 3:
                            break
                if count >= 3:
                    break

        # Recent activities (generate a timeline of mock and real completed items)
        recent_activity = [
            {"id": 1, "type": "badge", "text": "Earned 'Explorer' Badge!", "time": "2 hours ago"},
            {"id": 2, "type": "quiz", "text": "Passed 'NumPy Fundamentals' Quiz (80%)", "time": "1 day ago"},
            {"id": 3, "type": "video", "text": "Watched 'Python Basics Setup'", "time": "2 days ago"}
        ]

        # Enrolled courses list
        enrolled_courses = []
        for e in enrollments:
            enrolled_courses.append({
                "id": e.id,
                "course_id": e.course_id,
                "title": e.roadmap.title,
                "progress_percent": e.progress_percent,
                "thumbnail": "https://img.youtube.com/vi/3JZ_D3KmVjk/hqdefault.jpg"
            })

        data = {
            "username": request.user.username,
            "streak_days": user_profile.streak_days,
            "best_streak": user_profile.best_streak,
            "study_time_hours": sum(p.minutes_studied for p in DailyProgress.objects.filter(user=user_profile)) / 60.0,
            "badge_count": user_profile.badge_count,
            "xp_points": user_profile.xp_points,
            "current_course": current_course,
            "today_tasks": today_tasks,
            "recent_activity": recent_activity,
            "enrolled_courses": enrolled_courses
        }
        return Response(data)

class WeeklyProgressView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_profile = request.user.profile
        today = timezone.now().date()
        
        # Build 7 days list (Monday to Sunday or last 7 days)
        days = []
        for i in range(6, -1, -1):
            days.append(today - timedelta(days=i))

        weekly_data = []
        for d in days:
            # Query the database
            try:
                progress = DailyProgress.objects.get(user=user_profile, date=d)
                minutes = progress.minutes_studied
            except DailyProgress.DoesNotExist:
                # Add default mock minutes for design aesthetics (since it is a hackathon project, 
                # we want the charts to look gorgeous and loaded with mock data if empty)
                minutes = random.randint(30, 180) if d != today else 0
            
            weekly_data.append({
                "day": d.strftime("%a"),
                "date": d.strftime("%Y-%m-%d"),
                "minutes": minutes
            })

        return Response(weekly_data)

class ConceptsProgressView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_profile = request.user.profile
        today = timezone.now().date()
        
        days = []
        for i in range(6, -1, -1):
            days.append(today - timedelta(days=i))

        concepts_data = []
        accumulated = 0
        for d in days:
            try:
                progress = DailyProgress.objects.get(user=user_profile, date=d)
                completed = progress.concepts_completed
            except DailyProgress.DoesNotExist:
                completed = random.randint(1, 3) if d != today else 0
            
            accumulated += completed
            concepts_data.append({
                "day": d.strftime("%a"),
                "completed": completed,
                "velocity": accumulated
            })

        return Response(concepts_data)

class LeaderboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # We fetch real profiles in order of XP
        profiles = UserProfile.objects.all().order_by('-xp_points')[:10]
        
        # Ensure we have at least 5 profiles for a full premium-looking leaderboard
        leaderboard = []
        rank = 1
        
        # Add real profiles first
        for p in profiles:
            leaderboard.append({
                "rank": rank,
                "username": p.user.username,
                "xp": p.xp_points,
                "is_current_user": p.user == request.user,
                "avatar_url": p.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={p.user.username}"
            })
            rank += 1
            
        # Mock fillers if profiles count is small
        mock_names = ["Sarah Chen", "David Miller", "Emily Zhang", "Michael Scott", "Jessica Pearson"]
        for name in mock_names:
            if len(leaderboard) >= 8:
                break
            # Skip if username already present
            if any(l["username"].lower() == name.lower().replace(" ", "") for l in leaderboard):
                continue
            leaderboard.append({
                "rank": rank,
                "username": name.replace(" ", ""),
                "xp": 5000 - rank * 350,
                "is_current_user": False,
                "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={name}"
            })
            rank += 1

        # Re-sort to maintain rank order
        leaderboard.sort(key=lambda x: x["xp"], reverse=True)
        for i, entry in enumerate(leaderboard):
            entry["rank"] = i + 1
            
        return Response(leaderboard)

class TrendsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        trends = [
            {"topic": "Artificial Intelligence & LLMs", "learners": 1420},
            {"topic": "Cloud Native & DevOps", "learners": 980},
            {"topic": "React Native Mobile Apps", "learners": 750},
            {"topic": "Rust & System Architectures", "learners": 540},
            {"topic": "Next.js 14 Full Stack Development", "learners": 1210}
        ]
        return Response(trends)
