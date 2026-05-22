from django.urls import path
from .views import (
    InterviewStartView,
    InterviewQuestionsView,
    InterviewSubmitAnswerView,
    InterviewReportView,
)

urlpatterns = [
    path('start/', InterviewStartView.as_view(), name='interview_start'),
    path('<int:pk>/questions/', InterviewQuestionsView.as_view(), name='interview_questions'),
    path('<int:pk>/submit-answer/', InterviewSubmitAnswerView.as_view(), name='interview_submit_answer'),
    path('<int:pk>/report/', InterviewReportView.as_view(), name='interview_report'),
]
