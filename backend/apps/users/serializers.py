from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'learning_goal',
            'skill_level',
            'available_hours_per_week',
            'streak_days',
            'best_streak',
            'xp_points',
            'badge_count',
            'avatar_url',
            'last_active'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class RegisterSerializer(serializers.ModelSerializer):
    learning_goal = serializers.CharField(write_only=True, required=False)
    skill_level = serializers.CharField(write_only=True, required=False)
    available_hours_per_week = serializers.IntegerField(write_only=True, required=False)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'learning_goal', 'skill_level', 'available_hours_per_week']

    def create(self, validated_data):
        learning_goal = validated_data.pop('learning_goal', '')
        skill_level = validated_data.pop('skill_level', 'beginner')
        available_hours_per_week = validated_data.pop('available_hours_per_week', 5)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        UserProfile.objects.create(
            user=user,
            learning_goal=learning_goal,
            skill_level=skill_level,
            available_hours_per_week=available_hours_per_week
        )
        
        return user
