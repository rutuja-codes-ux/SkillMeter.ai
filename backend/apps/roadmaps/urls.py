from django.urls import path
from .views import RoadmapGenerateView, RoadmapListView, RoadmapDetailView

urlpatterns = [
    path('generate/', RoadmapGenerateView.as_view(), name='roadmap_generate'),
    path('', RoadmapListView.as_view(), name='roadmap_list'),
    path('<int:pk>/', RoadmapDetailView.as_view(), name='roadmap_detail'),
]
