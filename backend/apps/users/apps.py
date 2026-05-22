from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        # Register signals
        import apps.users.signals
        
        # Ensure all existing users have a profile on startup
        try:
            from django.contrib.auth.models import User
            from .models import UserProfile
            for user in User.objects.all():
                UserProfile.objects.get_or_create(user=user)
        except Exception as e:
            pass

