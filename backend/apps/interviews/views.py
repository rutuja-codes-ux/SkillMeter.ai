import requests
from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import MockInterview

class InterviewStartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_profile = request.user.profile
        topic = request.data.get('topic', 'PYTHON')
        difficulty = request.data.get('difficulty', 'Medium')

        fastapi_url = "http://localhost:8001/api/ai/interview/generate-questions"
        payload = {
            "topic": topic,
            "difficulty": difficulty,
            "count": 5
        }

        try:
            res = requests.post(fastapi_url, json=payload, timeout=20)
            if res.status_code == 200:
                questions = res.json()
            else:
                raise Exception("FastAPI returned error status")
        except Exception as e:
            print(f"FastAPI generate-questions failed, using local simulator: {e}")
            questions = self.simulate_interview_questions(topic, difficulty)

        # Create Interview Session
        interview = MockInterview.objects.create(
            user=user_profile,
            topic=topic,
            difficulty=difficulty,
            questions=questions,
            responses=[]
        )

        return Response({
            "interview_id": interview.id,
            "topic": interview.topic,
            "difficulty": interview.difficulty,
            "questions": interview.questions
        }, status=status.HTTP_201_CREATED)

    def simulate_interview_questions(self, topic, difficulty):
        return [
            {
                "id": 1,
                "question": f"Explain the core features and design patterns in {topic}."
            },
            {
                "id": 2,
                "question": f"What are the typical performance issues when using {topic} in production?"
            },
            {
                "id": 3,
                "question": f"How does memory allocation/state management work inside {topic}?"
            },
            {
                "id": 4,
                "question": f"Describe a complex architectural scenario where {topic} is preferred over alternatives."
            },
            {
                "id": 5,
                "question": f"How do you perform debugging and load testing in {topic} ecosystems?"
            }
        ]

class InterviewQuestionsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user_profile = request.user.profile
        try:
            interview = MockInterview.objects.get(id=pk, user=user_profile)
            return Response(interview.questions)
        except MockInterview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=404)

class InterviewSubmitAnswerView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user_profile = request.user.profile
        question_id = request.data.get('question_id')
        answer = request.data.get('answer', '')

        try:
            interview = MockInterview.objects.get(id=pk, user=user_profile)
        except MockInterview.DoesNotExist:
            return Response({"error": "Interview session not found"}, status=404)

        # Get question text
        question_text = ""
        for q in interview.questions:
            if q.get('id') == question_id:
                question_text = q.get('question')
                break

        if not question_text:
            return Response({"error": "Invalid question ID"}, status=400)

        # Call FastAPI to evaluate answer
        fastapi_url = "http://localhost:8001/api/ai/interview/evaluate-answer"
        payload = {
            "question": question_text,
            "answer": answer,
            "topic": interview.topic
        }

        try:
            res = requests.post(fastapi_url, json=payload, timeout=20)
            if res.status_code == 200:
                eval_data = res.json()
            else:
                raise Exception("FastAPI returned error status")
        except Exception as e:
            print(f"FastAPI evaluate-answer failed, using local simulator: {e}")
            eval_data = self.simulate_evaluation(question_text, answer)

        # Append response
        responses = list(interview.responses)
        # Check if already answered to prevent duplicates
        responses = [r for r in responses if r.get('question_id') != question_id]
        responses.append({
            "question_id": question_id,
            "question": question_text,
            "answer": answer,
            "rating": eval_data.get('rating', 7),
            "feedback": eval_data.get('feedback', 'Good response.'),
            "clarity": eval_data.get('clarity', 7),
            "technical_accuracy": eval_data.get('technical_accuracy', 7),
            "completeness": eval_data.get('completeness', 7)
        })
        interview.responses = responses

        # Check if all questions are answered
        if len(responses) >= len(interview.questions):
            interview.completed = True
            # Compute overall score
            total_score = sum(r.get('rating', 7) for r in responses)
            interview.overall_score = round(total_score / len(responses), 1)
            interview.feedback = f"Completed mock interview for {interview.topic}. Overall communication and technical structure scored {interview.overall_score}/10."
            
            # Award XP for interview completion
            user_profile.xp_points += 200
            user_profile.save()

        interview.save()

        return Response({
            "status": "success",
            "evaluation": responses[-1],
            "completed": interview.completed,
            "overall_score": interview.overall_score if interview.completed else None
        })

    def simulate_evaluation(self, question, answer):
        # A simple keyword based matching engine to compute a realistic score
        score = 6
        keywords = ["modular", "scalability", "pattern", "asynchronous", "efficiency", "state", "variables", "compile", "deployment"]
        for kw in keywords:
            if kw in answer.lower():
                score += 1
        score = min(score, 10)
        
        return {
            "rating": score,
            "clarity": min(score + 1, 10),
            "technical_accuracy": score,
            "completeness": min(score - 1, 10),
            "feedback": f"Your response demonstrates a practical understanding of the core concept. To score higher, explain the thread model and incorporate specific package names or concrete debugging steps."
        }

class InterviewReportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user_profile = request.user.profile
        try:
            interview = MockInterview.objects.get(id=pk, user=user_profile)
            return Response({
                "id": interview.id,
                "topic": interview.topic,
                "difficulty": interview.difficulty,
                "overall_score": interview.overall_score,
                "feedback": interview.feedback,
                "completed": interview.completed,
                "created_at": interview.created_at,
                "questions_count": len(interview.questions),
                "answers_count": len(interview.responses),
                "responses": interview.responses
            })
        except MockInterview.DoesNotExist:
            return Response({"error": "Interview not found"}, status=404)
