import os
import django
import sys
import uuid

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.roadmaps.models import Roadmap
from ai_services.orchestrator import simulate_roadmap
from ai_services.youtube_discovery import find_videos_for_topic

def fix_existing_roadmaps():
    print("--- Regenerating and Fixing Mismatched Roadmaps in SQLite Database ---")
    roadmaps = Roadmap.objects.all()
    if not roadmaps.exists():
        print("No roadmaps found in the database.")
        return

    updated_count = 0
    for r in roadmaps:
        print(f"\nChecking Roadmap ID {r.id}: '{r.title}' (Goal: '{r.goal}')")
        
        # Check if the roadmap goal is web-related
        goal_lower = r.goal.lower()
        is_web_related = any(k in goal_lower for k in ["web", "react", "html", "css", "js", "javascript", "node", "django", "frontend", "backend", "fullstack", "full stack"])

        # Check if current phases contain buggy web subtopics
        has_web_subtopics = False
        web_indicators = ["state management", "cors setup", "third-party apis", "persistent database schemas"]
        
        for phase in r.phases:
            for subtopic in phase.get('subtopics', []):
                title = subtopic.get('title', '').lower()
                if any(ind in title for ind in web_indicators):
                    has_web_subtopics = True
                    break
            if has_web_subtopics:
                break

        # If it has web subtopics but the goal is NOT web related, we need to regenerate
        if has_web_subtopics and not is_web_related:
            print(f"  -> Detected mismatched web-centric subtopics in non-web roadmap '{r.title}'. Regenerating...")
            
            # 1. Simulate new roadmap data with correct category template
            new_data = simulate_roadmap(r.goal, r.skill_level, r.total_weeks)
            
            # Update title and total_weeks if needed
            r.title = new_data.get("title", r.title)
            
            # 2. Re-format and fetch videos for each new subtopic
            phases_formatted = []
            for i, phase in enumerate(new_data.get('phases', [])):
                subtopics_formatted = []
                for sub in phase.get('subtopics', []):
                    print(f"    Fetching videos for subtopic: '{sub}'...")
                    videos = find_videos_for_topic(sub, max_results=2, context=r.goal)
                    
                    subtopics_formatted.append({
                        "id": str(uuid.uuid4()),
                        "title": sub,
                        "estimated_hours": 2,
                        "status": "not_started",
                        "videos": videos
                    })
                
                phases_formatted.append({
                    "phase_number": phase.get('phase_number', i + 1),
                    "title": phase.get('title', f"Phase {i+1}"),
                    "description": phase.get('description', f"Introduction and core concepts of {phase.get('title', 'this phase')}"),
                    "subtopics": subtopics_formatted
                })

            # Save the regenerated phases to the roadmap
            r.phases = phases_formatted
            r.save()
            updated_count += 1
            print(f"  -> Successfully regenerated and saved Roadmap ID {r.id}.")
        else:
            # Let's refresh the videos for all subtopics using the new context-aware discovery
            modified = False
            for phase in r.phases:
                for subtopic in phase.get('subtopics', []):
                    topic_title = subtopic.get('title')
                    print(f"    Refreshing videos for: '{topic_title}'...")
                    videos = find_videos_for_topic(topic_title, max_results=2, context=r.goal)
                    subtopic['videos'] = videos
                    modified = True
            
            if modified:
                r.save()
                updated_count += 1
                print(f"  -> Refreshed and optimized videos for Roadmap ID {r.id}.")
            else:
                print("  -> Roadmap is correct. No changes needed.")

    print(f"\n--- Done! Updated {updated_count} roadmaps in the database. ---")

if __name__ == "__main__":
    fix_existing_roadmaps()
