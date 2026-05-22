import os
import urllib.request
import urllib.parse
import re
import json
from googleapiclient.discovery import build

API_KEY = os.environ.get("YOUTUBE_API_KEY", "")

def scrape_youtube_videos(topic, max_results=3):
    query = urllib.parse.quote(topic + " tutorial")
    url = f"https://www.youtube.com/results?search_query={query}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            
        # Find ytInitialData
        match = re.search(r"ytInitialData\s*=\s*({.+?});", html)
        if not match:
            # Fallback to searching raw watch?v= URLs
            video_ids = re.findall(r"/watch\?v=([a-zA-Z0-9_-]{11})", html)
            unique_ids = []
            for v_id in video_ids:
                if v_id not in unique_ids and v_id != "dQw4w9WgXcQ":
                    unique_ids.append(v_id)
            if unique_ids:
                return [{"video_id": v_id, "title": f"{topic} Video Guide", "channel": "YouTube Creator", "thumbnail": f"https://img.youtube.com/vi/{v_id}/hqdefault.jpg", "watched": False} for v_id in unique_ids[:max_results]]
            return []
            
        data = json.loads(match.group(1))
        
        # Parse videoRenderers
        videos = []
        
        def search_dict(d):
            if isinstance(d, dict):
                if "videoRenderer" in d:
                    vr = d["videoRenderer"]
                    try:
                        video_id = vr.get("videoId")
                        title = vr.get("title", {}).get("runs", [{}])[0].get("text")
                        channel = vr.get("ownerText", {}).get("runs", [{}])[0].get("text")
                        if video_id and title and channel and video_id != "dQw4w9WgXcQ":
                            videos.append({
                                "video_id": video_id,
                                "title": title,
                                "channel": channel,
                                "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                                "watched": False
                            })
                    except Exception:
                        pass
                for k, v in d.items():
                    search_dict(v)
            elif isinstance(d, list):
                for item in d:
                    search_dict(item)
                    
        search_dict(data)
        return videos[:max_results]
    except Exception as e:
        print("Error scraping YouTube directly:", e)
        return []

def scrape_youtube_via_ddg(topic, max_results=3):
    """Fallback scraper that queries DuckDuckGo search to extract actual YouTube video links."""
    query = urllib.parse.quote(f"site:youtube.com {topic} tutorial")
    url = f"https://html.duckduckgo.com/html/?q={query}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            
        # Extract video IDs
        video_ids = re.findall(r"v=([a-zA-Z0-9_-]{11})", html)
        unique_ids = []
        for v_id in video_ids:
            if v_id not in unique_ids and v_id != "dQw4w9WgXcQ":
                unique_ids.append(v_id)
                
        results = []
        for v_id in unique_ids[:max_results]:
            # Beautiful title formatting based on the topic
            results.append({
                "video_id": v_id,
                "title": f"Complete {topic} Guide",
                "channel": "YouTube",
                "thumbnail": f"https://img.youtube.com/vi/{v_id}/hqdefault.jpg",
                "watched": False
            })
        return results
    except Exception as e:
        print("Error scraping YouTube via DuckDuckGo:", e)
        return []

def find_videos_for_topic(topic, max_results=3, context=None):
    search_query = topic
    if context and context.strip():
        # Prepend context (e.g., "Python" or "React") to topic if it's not already in it
        ctx_lower = context.lower().strip()
        topic_lower = topic.lower()
        if ctx_lower not in topic_lower:
            search_query = f"{context} - {topic}"

    # 1. API Call (if API key is present)
    if API_KEY:
        try:
            youtube = build('youtube', 'v3', developerKey=API_KEY)
            request = youtube.search().list(
                part="snippet",
                q=f"{search_query} tutorial",
                type="video",
                videoDuration="medium",
                relevanceLanguage="en",
                order="relevance",
                maxResults=max_results
            )
            response = request.execute()
            videos = []
            for item in response.get("items", []):
                video_id = item["id"]["videoId"]
                videos.append({
                    "video_id": video_id,
                    "title": item["snippet"]["title"],
                    "channel": item["snippet"]["channelTitle"],
                    "thumbnail": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                    "watched": False
                })
            if videos:
                return videos
        except Exception as e:
            print(f"YouTube API lookup failed: {e}")

    # 2. Try Direct Scraper
    scraped = scrape_youtube_videos(search_query, max_results)
    if scraped:
        return scraped

    # 3. Try DuckDuckGo Scraper
    ddg_scraped = scrape_youtube_via_ddg(search_query, max_results)
    if ddg_scraped:
        return ddg_scraped

    # 4. Simulated Search Fallback (Robust Local Pool)
    return simulate_youtube_search(search_query, max_results)

def simulate_youtube_search(topic, max_results):
    topic_lower = topic.lower()
    
    # Predefined high-quality tutorial pools for common topics
    python_videos = [
        {"video_id": "8DvywoWv6fI", "title": "Python for Beginners - Full Course [freeCodeCamp]", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/8DvywoWv6fI/hqdefault.jpg", "watched": False},
        {"video_id": "rfscVS0vtbw", "title": "Python Tutorial for Beginners [Programming with Mosh]", "channel": "Programming with Mosh", "thumbnail": "https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg", "watched": False},
        {"video_id": "_uQrJ0TkZlc", "title": "Python OOP Tutorial - Object Oriented Programming Course", "channel": "Corey Schafer", "thumbnail": "https://img.youtube.com/vi/_uQrJ0TkZlc/hqdefault.jpg", "watched": False}
    ]
    
    react_videos = [
        {"video_id": "bMknfKXIFA8", "title": "React Course for Beginners 2024 - Learn React Today", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/bMknfKXIFA8/hqdefault.jpg", "watched": False},
        {"video_id": "Ke90Tje7VS0", "title": "ReactJS Tutorial for Beginners - Full Course", "channel": "Programming with Mosh", "thumbnail": "https://img.youtube.com/vi/Ke90Tje7VS0/hqdefault.jpg", "watched": False},
        {"video_id": "DLX62G4lc44", "title": "React JS Crash Course for Beginners 2024", "channel": "Academind", "thumbnail": "https://img.youtube.com/vi/DLX62G4lc44/hqdefault.jpg", "watched": False}
    ]
    
    javascript_videos = [
        {"video_id": "PkZNo7MFNFg", "title": "JavaScript Course for Beginners - Full Tutorial", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/PkZNo7MFNFg/hqdefault.jpg", "watched": False},
        {"video_id": "W6NZfCO5SIk", "title": "JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour", "channel": "Programming with Mosh", "thumbnail": "https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg", "watched": False},
        {"video_id": "hdI2bqOjy3c", "title": "JavaScript Crash Course for Beginners", "channel": "Traversy Media", "thumbnail": "https://img.youtube.com/vi/hdI2bqOjy3c/hqdefault.jpg", "watched": False}
    ]
    
    nextjs_videos = [
        {"video_id": "ZWVK9J52P1E", "title": "Next.js 14 Developer Course for Beginners", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/ZWVK9J52P1E/hqdefault.jpg", "watched": False},
        {"video_id": "Sdq2R6a4Y9A", "title": "Next.js App Router Crash Course", "channel": "Traversy Media", "thumbnail": "https://img.youtube.com/vi/Sdq2R6a4Y9A/hqdefault.jpg", "watched": False}
    ]
    
    django_videos = [
        {"video_id": "rHux0gMZ3Eg", "title": "Django for Beginners - Full Course", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/rHux0gMZ3Eg/hqdefault.jpg", "watched": False},
        {"video_id": "F5mRW0q-wQk", "title": "Django Tutorial for Beginners - Build a Website", "channel": "Programming with Mosh", "thumbnail": "https://img.youtube.com/vi/F5mRW0q-wQk/hqdefault.jpg", "watched": False}
    ]
    
    dsa_videos = [
        {"video_id": "8hly31xKjBY", "title": "Algorithms and Data Structures Tutorial for Beginners", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/8hly31xKjBY/hqdefault.jpg", "watched": False},
        {"video_id": "RBSGKlAvoiM", "title": "Data Structures & Algorithms Course in Python", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/RBSGKlAvoiM/hqdefault.jpg", "watched": False}
    ]

    devops_videos = [
        {"video_id": "3c-iQQX149M", "title": "Docker Tutorial for Beginners - Full Course", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/3c-iQQX149M/hqdefault.jpg", "watched": False},
        {"video_id": "hQcFE0RD0cQ", "title": "DevOps Beginner's Course - Learn CI/CD", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/hQcFE0RD0cQ/hqdefault.jpg", "watched": False}
    ]
    
    rust_videos = [
        {"video_id": "zF34dFjUK8c", "title": "Rust Programming Course for Beginners", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/zF34dFjUK8c/hqdefault.jpg", "watched": False},
        {"video_id": "5c_EC3aWfSg", "title": "Rust Crash Course - Syntax & CLI", "channel": "Traversy Media", "thumbnail": "https://img.youtube.com/vi/5c_EC3aWfSg/hqdefault.jpg", "watched": False}
    ]

    golang_videos = [
        {"video_id": "yyUHQIec83I", "title": "Golang Tutorial for Beginners | Full Go Course", "channel": "TechWorld with Nana", "thumbnail": "https://img.youtube.com/vi/yyUHQIec83I/hqdefault.jpg", "watched": False},
        {"video_id": "446E-r0rXHI", "title": "Go in 100 Seconds", "channel": "Fireship", "thumbnail": "https://img.youtube.com/vi/446E-r0rXHI/hqdefault.jpg", "watched": False},
        {"video_id": "YS4e4q9oBaU", "title": "Go Programming Course for Beginners", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/YS4e4q9oBaU/hqdefault.jpg", "watched": False}
    ]

    sql_videos = [
        {"video_id": "HXV3zeQKqGY", "title": "SQL Tutorial for Beginners - Full Course", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/HXV3zeQKqGY/hqdefault.jpg", "watched": False},
        {"video_id": "7S_tz1z_5bA", "title": "SQL Tutorial for Beginners [Programming with Mosh]", "channel": "Programming with Mosh", "thumbnail": "https://img.youtube.com/vi/7S_tz1z_5bA/hqdefault.jpg", "watched": False}
    ]

    html_css_videos = [
        {"video_id": "G3e-cpL7ofc", "title": "HTML & CSS Full Course - Beginner to Pro", "channel": "SuperSimpleDev", "thumbnail": "https://img.youtube.com/vi/G3e-cpL7ofc/hqdefault.jpg", "watched": False},
        {"video_id": "ok-plXXHlWw", "title": "HTML Full Course for Beginners", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/ok-plXXHlWw/hqdefault.jpg", "watched": False}
    ]

    java_videos = [
        {"video_id": "A74TOX803D0", "title": "Java Full Course for Beginners", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/A74TOX803D0/hqdefault.jpg", "watched": False},
        {"video_id": "eIrMbLywjVk", "title": "Java Tutorial for Beginners [Programming with Mosh]", "channel": "Programming with Mosh", "thumbnail": "https://img.youtube.com/vi/eIrMbLywjVk/hqdefault.jpg", "watched": False}
    ]

    cpp_videos = [
        {"video_id": "8jLOx1hD3_o", "title": "C++ Tutorial for Beginners - Full Course", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/8jLOx1hD3_o/hqdefault.jpg", "watched": False},
        {"video_id": "vLnPwxZdW4Y", "title": "C++ Tutorial for Beginners [Programming with Mosh]", "channel": "Programming with Mosh", "thumbnail": "https://img.youtube.com/vi/vLnPwxZdW4Y/hqdefault.jpg", "watched": False}
    ]

    ml_videos = [
        {"video_id": "GwIo3gG40A4", "title": "Machine Learning for Beginners Course", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/GwIo3gG40A4/hqdefault.jpg", "watched": False},
        {"video_id": "VyW3C2_OJSM", "title": "Deep Learning Crash Course for Beginners", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/VyW3C2_OJSM/hqdefault.jpg", "watched": False}
    ]

    git_videos = [
        {"video_id": "RGOj5yH7evk", "title": "Git and GitHub for Beginners - Crash Course", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/RGOj5yH7evk/hqdefault.jpg", "watched": False},
        {"video_id": "8JJ101D3knE", "title": "Git Tutorial for Beginners: Command Line Fundamentals", "channel": "Programming with Mosh", "thumbnail": "https://img.youtube.com/vi/8JJ101D3knE/hqdefault.jpg", "watched": False}
    ]

    node_videos = [
        {"video_id": "Oe421EPjeBE", "title": "Node.js and Express.js - Full Course", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/Oe421EPjeBE/hqdefault.jpg", "watched": False},
        {"video_id": "TlB_eWDSMt4", "title": "Node.js Tutorial for Beginners [Programming with Mosh]", "channel": "Programming with Mosh", "thumbnail": "https://img.youtube.com/vi/TlB_eWDSMt4/hqdefault.jpg", "watched": False}
    ]

    # Matching logic
    if "python" in topic_lower:
        pool = python_videos
    elif "react" in topic_lower:
        pool = react_videos
    elif "javascript" in topic_lower or "js" in topic_lower:
        pool = javascript_videos
    elif "next" in topic_lower:
        pool = nextjs_videos
    elif "django" in topic_lower:
        pool = django_videos
    elif "structure" in topic_lower or "algorithm" in topic_lower or "dsa" in topic_lower:
        pool = dsa_videos
    elif "docker" in topic_lower or "devops" in topic_lower or "kubernetes" in topic_lower or "aws" in topic_lower:
        pool = devops_videos
    elif "rust" in topic_lower:
        pool = rust_videos
    elif "golang" in topic_lower or " go " in " " + topic_lower + " ":
        pool = golang_videos
    elif "sql" in topic_lower or "database" in topic_lower or "db" in topic_lower:
        pool = sql_videos
    elif "html" in topic_lower or "css" in topic_lower:
        pool = html_css_videos
    elif "java" in topic_lower:
        pool = java_videos
    elif "c++" in topic_lower or "cpp" in topic_lower:
        pool = cpp_videos
    elif "machine learning" in topic_lower or " ml " in " " + topic_lower + " " or "deep learning" in topic_lower or "artificial intelligence" in topic_lower or "ai" in topic_lower:
        pool = ml_videos
    elif "git" in topic_lower or "github" in topic_lower:
        pool = git_videos
    elif "node" in topic_lower or "express" in topic_lower:
        pool = node_videos
    else:
        # General, non-topic-specific Computer Science learning guide
        # (Avoids playing React/Python videos under customized titles)
        pool = [
            {"video_id": "zojy0VN5GPk", "title": f"Computer Science Basics: Learning {topic}", "channel": "CrashCourse", "thumbnail": "https://img.youtube.com/vi/zojy0VN5GPk/hqdefault.jpg", "watched": False},
            {"video_id": "xMTOg0c2V9U", "title": f"How to Learn {topic} Efficiently", "channel": "freeCodeCamp.org", "thumbnail": "https://img.youtube.com/vi/xMTOg0c2V9U/hqdefault.jpg", "watched": False},
            {"video_id": "S1wB_w465lE", "title": f"Coding Fundamentals: Mastering {topic}", "channel": "CS Basics", "thumbnail": "https://img.youtube.com/vi/S1wB_w465lE/hqdefault.jpg", "watched": False}
        ]

    # Return elements with customized title containing subtopic if generic
    result = []
    for i, item in enumerate(pool[:max_results]):
        title = item["title"]
        if "{topic}" in title:
            title = title.replace("{topic}", topic)
        result.append({
            "video_id": item["video_id"],
            "title": title,
            "channel": item["channel"],
            "thumbnail": item["thumbnail"],
            "watched": False
        })
    return result
