from django.urls import path
from .views import (
    DashboardView,
    WeeklyProgressView,
    ConceptsProgressView,
    LeaderboardView,
    TrendsView,
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard_stats'),
    path('weekly/', WeeklyProgressView.as_view(), name='weekly_progress'),
    path('concepts/', ConceptsProgressView.as_view(), name='concepts_progress'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('trends/', TrendsView.as_view(), name='trends'),
]
