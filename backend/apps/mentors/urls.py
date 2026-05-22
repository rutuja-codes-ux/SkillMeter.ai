from django.urls import path
from .views import (
    MentorListView,
    MentorDetailView,
    MentorConnectView,
    MentorBookView,
    MentorTrendingView,
)

urlpatterns = [
    path('', MentorListView.as_view(), name='mentor_list'),
    path('trending/', MentorTrendingView.as_view(), name='mentor_trending'),
    path('<int:pk>/', MentorDetailView.as_view(), name='mentor_detail'),
    path('<int:pk>/connect/', MentorConnectView.as_view(), name='mentor_connect'),
    path('<int:pk>/book/', MentorBookView.as_view(), name='mentor_book'),
]
