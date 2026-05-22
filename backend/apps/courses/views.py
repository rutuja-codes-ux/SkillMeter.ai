from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import CourseEnrollment
from apps.roadmaps.models import Roadmap
from django.utils import timezone
from apps.progress.models import DailyProgress
from apps.users.models import UserProfile


class CourseListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
            
        enrollments = CourseEnrollment.objects.filter(user=user_profile)
        data = []
        for e in enrollments:
            data.append({
                "id": e.id,
                "course_id": e.course_id,
                "title": e.roadmap.title,
                "progress_percent": e.progress_percent,
                "enrolled_at": e.enrolled_at,
                "completed_at": e.completed_at,
                "roadmap_phases": e.roadmap.phases
            })
        return Response(data)

class CourseDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
            
        try:
            e = CourseEnrollment.objects.get(id=pk, user=user_profile)
        except (ValueError, CourseEnrollment.DoesNotExist):
            try:
                e = CourseEnrollment.objects.get(roadmap__id=pk, user=user_profile)
            except (ValueError, CourseEnrollment.DoesNotExist):
                # Self-healing: auto-enroll user if the Roadmap exists
                try:
                    roadmap = Roadmap.objects.get(id=pk, user=user_profile)
                    e = CourseEnrollment.objects.create(
                        user=user_profile,
                        roadmap=roadmap,
                        progress_percent=0.0
                    )
                except (ValueError, Roadmap.DoesNotExist):
                    return Response({"error": "Course not found"}, status=404)

        return Response({
            "id": e.id,
            "course_id": e.course_id,
            "title": e.roadmap.title,
            "progress_percent": e.progress_percent,
            "enrolled_at": e.enrolled_at,
            "completed_at": e.completed_at,
            "roadmap_phases": e.roadmap.phases
        })

class CourseLessonsListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
            
        try:
            # course_id corresponds to the roadmap ID or enrollment ID
            # Let's support both
            try:
                enrollment = CourseEnrollment.objects.get(id=course_id, user=user_profile)
            except (ValueError, CourseEnrollment.DoesNotExist):
                try:
                    enrollment = CourseEnrollment.objects.get(roadmap__id=course_id, user=user_profile)
                except (ValueError, CourseEnrollment.DoesNotExist):
                    # Self-healing: auto-enroll user if the Roadmap exists
                    try:
                        roadmap = Roadmap.objects.get(id=course_id, user=user_profile)
                        enrollment = CourseEnrollment.objects.create(
                            user=user_profile,
                            roadmap=roadmap,
                            progress_percent=0.0
                        )
                    except (ValueError, Roadmap.DoesNotExist):
                        return Response({"error": "Course not found"}, status=404)

            # Flatten lessons (subtopics) from the roadmap phases
            lessons = []
            for phase in enrollment.roadmap.phases:
                for subtopic in phase.get('subtopics', []):
                    lessons.append({
                        "id": subtopic.get('id'),
                        "title": subtopic.get('title'),
                        "phase_title": phase.get('title'),
                        "status": subtopic.get('status', 'not_started'),
                        "videos": subtopic.get('videos', []),
                        "estimated_hours": subtopic.get('estimated_hours', 2)
                    })
            return Response(lessons)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class LessonDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lesson_id):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
            
        # Find the subtopic with matching lesson_id across all user's roadmaps
        roadmaps = Roadmap.objects.filter(user=user_profile)
        for r in roadmaps:
            for phase in r.phases:
                for sub in phase.get('subtopics', []):
                    if sub.get('id') == lesson_id:
                        return Response({
                            "id": sub.get('id'),
                            "title": sub.get('title'),
                            "status": sub.get('status'),
                            "videos": sub.get('videos'),
                            "estimated_hours": sub.get('estimated_hours', 2),
                            "roadmap_id": r.id,
                            "phase_title": phase.get('title')
                        })
        return Response({"error": "Lesson not found"}, status=404)

class LessonCompleteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
            
        roadmaps = Roadmap.objects.filter(user=user_profile)
        
        found = False
        target_roadmap = None
        
        for r in roadmaps:
            for phase in r.phases:
                for sub in phase.get('subtopics', []):
                    if sub.get('id') == lesson_id:
                        if sub.get('status') != 'completed':
                            sub['status'] = 'completed'
                            # Mark all videos inside this subtopic as watched
                            for vid in sub.get('videos', []):
                                vid['watched'] = True
                            found = True
                            target_roadmap = r
                            break
                if found:
                    break
            if found:
                break

        if not found or not target_roadmap:
            return Response({"error": "Lesson not found or already completed"}, status=404)

        # Recalculate Roadmap progress
        total_subtopics = 0
        completed_subtopics = 0
        for phase in target_roadmap.phases:
            for sub in phase.get('subtopics', []):
                total_subtopics += 1
                if sub.get('status') == 'completed':
                    completed_subtopics += 1

        progress_percent = round((completed_subtopics / total_subtopics) * 100, 2) if total_subtopics > 0 else 100.0

        # Save Roadmap modifications
        target_roadmap.save()

        # Update Course Enrollment progress
        enrollment = CourseEnrollment.objects.get(roadmap=target_roadmap, user=user_profile)
        enrollment.progress_percent = progress_percent
        if progress_percent >= 100.0 and not enrollment.completed_at:
            enrollment.completed_at = timezone.now()
            # Reward extra XP for course completion
            user_profile.xp_points += 500
            user_profile.badge_count += 1
        
        enrollment.save()

        # Reward XP for completing a lesson
        user_profile.xp_points += 50
        user_profile.streak_days += 1
        if user_profile.streak_days > user_profile.best_streak:
            user_profile.best_streak = user_profile.streak_days
        user_profile.save()

        # Log daily progress
        today = timezone.now().date()
        daily_prog, _ = DailyProgress.objects.get_or_create(user=user_profile, date=today)
        daily_prog.minutes_studied += 20  # Assume 20 minutes study per lesson complete
        daily_prog.concepts_completed += 1
        daily_prog.videos_watched += 1
        daily_prog.save()

        return Response({
            "status": "success",
            "progress_percent": progress_percent,
            "xp_earned": 50,
            "new_xp": user_profile.xp_points,
            "streak_days": user_profile.streak_days
        })
