import requests
from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import AssessmentResult
from apps.users.models import UserProfile

class QuizGenerateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        topic = request.data.get('topic', '')
        if not topic:
            return Response({"error": "Topic is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Call FastAPI backend for quiz generation (which uses Gemini)
        fastapi_url = "http://localhost:8001/api/ai/generate-quiz"
        try:
            res = requests.post(fastapi_url, json={"topic": topic}, timeout=20)
            if res.status_code == 200:
                quiz_data = res.json()
                return Response(quiz_data)
        except Exception as e:
            print(f"FastAPI generate-quiz failed, using local simulator: {e}")

        # Local simulation fallback
        mock_quiz = {
            "topic": topic,
            "questions": [
                {
                    "id": 1,
                    "question": f"What is the primary purpose of {topic}?",
                    "options": [
                        "To write layout styling",
                        "To manage structured operations and system state",
                        "To host content servers",
                        "To implement basic encryption"
                    ],
                    "correct_answer": 1
                },
                {
                    "id": 2,
                    "question": f"Which module handles core implementation in {topic}?",
                    "options": [
                        "The standard system driver",
                        "The default routing dispatcher",
                        "The processing engine compiler",
                        "Depends on the framework setting"
                    ],
                    "correct_answer": 3
                },
                {
                    "id": 3,
                    "question": f"What is a major performance bottleneck of {topic}?",
                    "options": [
                        "Inefficient storage mapping",
                        "CPU throttling",
                        "Unnecessary network polling",
                        "Excessive visual redraw cycles"
                    ],
                    "correct_answer": 0
                },
                {
                    "id": 4,
                    "question": f"How is configuration configured in {topic}?",
                    "options": [
                        "Via environment setting variables",
                        "Hardcoded in core files",
                        "Fetched from central CDNs",
                        "Not customizable"
                    ],
                    "correct_answer": 0
                },
                {
                    "id": 5,
                    "question": f"Which design pattern is most commonly used in {topic}?",
                    "options": [
                        "Observer / Reactive Pattern",
                        "Singleton Pattern",
                        "Decorator Pattern",
                        "Facade Pattern"
                    ],
                    "correct_answer": 0
                }
            ]
        }
        return Response(mock_quiz)

class QuizSubmitView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
        quiz_topic = request.data.get('topic', '')
        score = request.data.get('score', 0)
        total_questions = request.data.get('total_questions', 5)

        if not quiz_topic:
            return Response({"error": "Topic is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Create record
        result = AssessmentResult.objects.create(
            user=user_profile,
            quiz_topic=quiz_topic,
            score=score,
            total_questions=total_questions
        )

        # Award XP based on score
        xp_earned = 0
        if score >= 4:
            xp_earned = 100
        elif score >= 3:
            xp_earned = 50
        else:
            xp_earned = 10

        user_profile.xp_points += xp_earned
        # Give a badge if they score perfect!
        if score == total_questions:
            user_profile.badge_count += 1
            badge_earned = True
        else:
            badge_earned = False
            
        user_profile.save()

        return Response({
            "status": "success",
            "score": score,
            "total_questions": total_questions,
            "xp_earned": xp_earned,
            "badge_earned": badge_earned,
            "new_xp": user_profile.xp_points
        }, status=status.HTTP_201_CREATED)
