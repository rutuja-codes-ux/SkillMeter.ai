import uuid
import requests
from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import Roadmap
from apps.users.models import UserProfile
from apps.courses.models import CourseEnrollment
from django.utils import timezone

import os
import sys

# Ensure backend directory is in path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

try:
    from ai_services.youtube_discovery import find_videos_for_topic
except ImportError:
    def find_videos_for_topic(topic, max_results=3, context=None):
        # Fallback to general, high-quality CS basics videos instead of specific language mismatches
        return [
            {
                "video_id": "zojy0VN5GPk",
                "title": f"Computer Science Basics: Learning {topic}",
                "channel": "CrashCourse",
                "thumbnail": "https://img.youtube.com/vi/zojy0VN5GPk/hqdefault.jpg",
                "watched": False
            },
            {
                "video_id": "xMTOg0c2V9U",
                "title": f"How to Learn {topic} Efficiently",
                "channel": "freeCodeCamp.org",
                "thumbnail": "https://img.youtube.com/vi/xMTOg0c2V9U/hqdefault.jpg",
                "watched": False
            }
        ]

class RoadmapGenerateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)

        goal = request.data.get('goal', '')
        skill_level = request.data.get('skill_level', 'beginner')
        hours_per_week = request.data.get('hours_per_week', 5)

        if not goal:
            return Response({"error": "Goal is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Call FastAPI AI services orchestrator
        fastapi_url = "http://localhost:8001/api/ai/generate-roadmap"
        payload = {
            "goal": goal,
            "skill_level": skill_level,
            "hours_per_week": int(hours_per_week)
        }

        try:
            # Let's request the roadmap from our FastAPI microservice
            response = requests.post(fastapi_url, json=payload, timeout=30)
            if response.status_code == 200:
                roadmap_data = response.json()
            else:
                raise Exception("FastAPI service returned error status")
        except Exception as e:
            # Robust fallback: Generate a smart simulated roadmap locally if FastAPI is not running!
            print(f"FastAPI connection failed, using local simulator: {e}")
            try:
                from ai_services.orchestrator import simulate_roadmap
                roadmap_data = simulate_roadmap(goal, skill_level, hours_per_week)
            except Exception as nested_err:
                print(f"Local simulator import failed: {nested_err}")
                roadmap_data = self.simulate_roadmap_generation(goal, skill_level, hours_per_week)

        # Re-format phases structure to include completion state status, watched video items, and IDs
        phases_formatted = []
        for i, phase in enumerate(roadmap_data.get('phases', [])):
            subtopics_formatted = []
            for sub in phase.get('subtopics', []):
                # Fetch videos for subtopic
                videos = []
                try:
                    video_res = requests.get(f"http://localhost:8001/api/ai/youtube-discovery", params={"topic": sub, "context": goal}, timeout=10)
                    if video_res.status_code == 200:
                        videos = video_res.json()
                except Exception:
                    pass
                
                # If no videos found, use the local simulated search (which returns real programming tutorials)
                if not videos:
                    try:
                        videos = find_videos_for_topic(sub, max_results=2, context=goal)
                    except Exception:
                        pass

                # Final guard to ensure we always have high-quality links
                if not videos:
                    videos = [
                        {
                            "video_id": "zojy0VN5GPk",
                            "title": f"Computer Science Basics: Learning {sub}",
                            "channel": "CrashCourse",
                            "thumbnail": "https://img.youtube.com/vi/zojy0VN5GPk/hqdefault.jpg",
                            "watched": False
                        },
                        {
                            "video_id": "xMTOg0c2V9U",
                            "title": f"How to Learn {sub} Efficiently",
                            "channel": "freeCodeCamp.org",
                            "thumbnail": "https://img.youtube.com/vi/xMTOg0c2V9U/hqdefault.jpg",
                            "watched": False
                        }
                    ]

                subtopics_formatted.append({
                    "id": str(uuid.uuid4()),
                    "title": sub,
                    "estimated_hours": 2,
                    "status": "not_started",
                    "videos": videos
                })
            
            phases_formatted.append({
                "phase_number": phase.get('phase_number', i + 1),
                "title": phase.get('title', f"Phase {i+1}"),
                "description": phase.get('description', f"Introduction and core concepts of {phase.get('title', 'this phase')}"),
                "subtopics": subtopics_formatted
            })

        # Save Roadmap
        title = roadmap_data.get('title', f"Custom {goal} Roadmap")
        roadmap = Roadmap.objects.create(
            user=user_profile,
            title=title,
            goal=goal,
            skill_level=skill_level,
            total_weeks=roadmap_data.get('total_weeks', 4),
            phases=phases_formatted
        )

        # Create Course Enrollment
        CourseEnrollment.objects.create(
            user=user_profile,
            roadmap=roadmap,
            progress_percent=0.0
        )

        return Response({
            "id": roadmap.id,
            "title": roadmap.title,
            "goal": roadmap.goal,
            "skill_level": roadmap.skill_level,
            "total_weeks": roadmap.total_weeks,
            "phases": roadmap.phases
        }, status=status.HTTP_201_CREATED)

    def simulate_roadmap_generation(self, goal, skill_level, hours_per_week):
        # A smart roadmap layout based on common learning goals
        return {
            "title": f"Mastering {goal} for Beginners",
            "total_weeks": 4,
            "phases": [
                {
                    "phase_number": 1,
                    "title": "Fundamentals & Core Foundations",
                    "description": f"Grasp the basic language rules and system mechanics of {goal}.",
                    "subtopics": [f"Introduction to {goal}", f"Syntax, Variables, and Setup for {goal}", f"Working with Basic Logic in {goal}"]
                },
                {
                    "phase_number": 2,
                    "title": "Intermediate Architectures",
                    "description": f"Learn components structuring and external API integrations for {goal}.",
                    "subtopics": [f"Building Data Pipelines in {goal}", f"State Management and Functions of {goal}", f"Integrating APIs in {goal}"]
                },
                {
                    "phase_number": 3,
                    "title": "Practice Labs & Quizzes",
                    "description": f"Verify theoretical concepts through practice exercises.",
                    "subtopics": [f"Debugging and Error Handling in {goal}", f"Optimizing {goal} Performance", f"Deployment of {goal}"]
                }
            ]
        }

class RoadmapListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
            
        roadmaps = Roadmap.objects.filter(user=user_profile)
        data = []
        for r in roadmaps:
            data.append({
                "id": r.id,
                "title": r.title,
                "goal": r.goal,
                "skill_level": r.skill_level,
                "total_weeks": r.total_weeks,
                "phases": r.phases,
                "created_at": r.created_at
            })
        return Response(data)

class RoadmapDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
            
        try:
            r = Roadmap.objects.get(id=pk, user=user_profile)
            return Response({
                "id": r.id,
                "title": r.title,
                "goal": r.goal,
                "skill_level": r.skill_level,
                "total_weeks": r.total_weeks,
                "phases": r.phases,
                "created_at": r.created_at
            })
        except Roadmap.DoesNotExist:
            return Response({"error": "Roadmap not found"}, status=404)
