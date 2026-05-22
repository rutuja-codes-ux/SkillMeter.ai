from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import MentorProfile

class MentorListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Fetch existing profiles
        profiles = MentorProfile.objects.all()
        
        # If DB is empty, let's return the rich pre-populated list from the specifications!
        if not profiles.exists():
            return Response(self.get_mock_mentors())
            
        data = []
        for p in profiles:
            data.append({
                "id": p.id,
                "name": f"{p.user.first_name} {p.user.last_name}",
                "title": p.title,
                "company": p.company,
                "skills": p.skills,
                "hourly_rate_inr": p.hourly_rate_inr,
                "rating": p.rating,
                "total_sessions": p.total_sessions,
                "is_trending": p.is_trending,
                "avatar_url": p.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={p.user.username}"
            })
        return Response(data)

    def get_mock_mentors(self):
        return [
            {
                "id": 1,
                "name": "Sarah Chen",
                "title": "Senior Data Scientist",
                "company": "Meta",
                "skills": ["Python", "ML", "Deep Learning"],
                "hourly_rate_inr": 0, # Free
                "rating": 4.9,
                "total_sessions": 128,
                "is_trending": True,
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
            },
            {
                "id": 2,
                "name": "David Miller",
                "title": "Senior Data Scientist",
                "company": "ORCA",
                "skills": ["Python", "AI", "Cloud"],
                "hourly_rate_inr": 500,
                "rating": 4.8,
                "total_sessions": 85,
                "is_trending": True,
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
            },
            {
                "id": 3,
                "name": "Emily Zhang",
                "title": "Rust Core Contributor",
                "company": "Rust Foundation",
                "skills": ["Rust", "WASM", "Systems"],
                "hourly_rate_inr": 750,
                "rating": 5.0,
                "total_sessions": 64,
                "is_trending": True,
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
            },
            {
                "id": 4,
                "name": "Michael Scott",
                "title": "Regional Manager",
                "company": "Dunder Mifflin",
                "skills": ["Leadership", "Management", "Behavioral"],
                "hourly_rate_inr": 0,
                "rating": 3.5,
                "total_sessions": 12,
                "is_trending": False,
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
            },
            {
                "id": 5,
                "name": "Jessica Pearson",
                "title": "Managing Partner",
                "company": "Pearson Specter Litt",
                "skills": ["Business", "Negotiation", "Law"],
                "hourly_rate_inr": 1500,
                "rating": 5.0,
                "total_sessions": 45,
                "is_trending": False,
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica"
            },
            {
                "id": 6,
                "name": "Gil Hoyle",
                "title": "Tech Lead",
                "company": "Hooli",
                "skills": ["Algorithms", "C++", "Architecture"],
                "hourly_rate_inr": 400,
                "rating": 4.7,
                "total_sessions": 98,
                "is_trending": False,
                "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Gil"
            }
        ]

class MentorDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        # Return detail. If mock, lookup by int(pk)
        mocks = MentorListView().get_mock_mentors()
        for m in mocks:
            if m["id"] == int(pk):
                return Response(m)
        
        try:
            p = MentorProfile.objects.get(id=pk)
            return Response({
                "id": p.id,
                "name": f"{p.user.first_name} {p.user.last_name}",
                "title": p.title,
                "company": p.company,
                "skills": p.skills,
                "hourly_rate_inr": p.hourly_rate_inr,
                "rating": p.rating,
                "total_sessions": p.total_sessions,
                "is_trending": p.is_trending,
                "avatar_url": p.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={p.user.username}"
            })
        except MentorProfile.DoesNotExist:
            return Response({"error": "Mentor not found"}, status=404)

class MentorConnectView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Mock connection request
        return Response({
            "status": "success",
            "message": "Connection request sent successfully! The mentor will review it shortly."
        })

class MentorBookView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Mock session booking with fake Razorpay ID
        return Response({
            "status": "success",
            "message": "Session booked successfully!",
            "razorpay_order_id": "order_mock_123456",
            "amount_paid": request.data.get('amount', 500),
            "date": request.data.get('date', '2026-05-30'),
            "time_slot": request.data.get('time_slot', '10:00 AM - 11:00 AM')
        })

class MentorTrendingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        mocks = MentorListView().get_mock_mentors()
        trending = [m for m in mocks if m["is_trending"]]
        return Response(trending)
