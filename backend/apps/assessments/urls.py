from django.urls import path
from .views import QuizGenerateView, QuizSubmitView

urlpatterns = [
    path('generate-quiz/', QuizGenerateView.as_view(), name='quiz_generate'),
    path('submit/', QuizSubmitView.as_view(), name='quiz_submit'),
]
