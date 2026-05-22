from django.urls import path
from .views import (
    CourseListView,
    CourseDetailView,
    CourseLessonsListView,
    LessonDetailView,
    LessonCompleteView,
)

urlpatterns = [
    path('', CourseListView.as_view(), name='course_list'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course_detail'),
    path('<int:course_id>/lessons/', CourseLessonsListView.as_view(), name='course_lessons_list'),
    path('lessons/<str:lesson_id>/', LessonDetailView.as_view(), name='lesson_detail'),
    path('lessons/<str:lesson_id>/complete/', LessonCompleteView.as_view(), name='lesson_complete'),
]
