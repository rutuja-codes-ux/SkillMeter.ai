from django.contrib import admin
from django.urls import path, include
from apps.progress.views import DashboardView
from apps.courses.views import LessonDetailView, LessonCompleteView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Custom API endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/roadmaps/', include('apps.roadmaps.urls')),
    path('api/courses/', include('apps.courses.urls')),
    
    path('api/lessons/<str:lesson_id>/', LessonDetailView.as_view(), name='lesson_detail'),
    path('api/lessons/<str:lesson_id>/complete/', LessonCompleteView.as_view(), name='lesson_complete'),
    
    path('api/assessments/', include('apps.assessments.urls')),
    path('api/progress/', include('apps.progress.urls')),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard_direct'),
    path('api/mentors/', include('apps.mentors.urls')),
    path('api/interviews/', include('apps.interviews.urls')),
    path('api/certificates/', include('apps.certificates.urls')),
]
