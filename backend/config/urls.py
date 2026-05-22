from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from apps.progress.views import DashboardView
from apps.courses.views import LessonDetailView, LessonCompleteView

def api_root(request):
    return JsonResponse({
        "status": "healthy",
        "service": "SkillMeter.ai Backend API",
        "version": "1.0.0",
        "endpoints": {
            "admin": "/admin/",
            "auth": "/api/auth/",
            "roadmaps": "/api/roadmaps/",
            "courses": "/api/courses/",
            "assessments": "/api/assessments/",
            "progress": "/api/progress/",
            "dashboard": "/api/dashboard/",
            "mentors": "/api/mentors/",
            "interviews": "/api/interviews/",
            "certificates": "/api/certificates/"
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
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

