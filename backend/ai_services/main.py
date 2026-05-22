from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from ai_services.orchestrator import (
    generate_roadmap_ai,
    generate_notes_ai,
    generate_quiz_ai,
    generate_interview_questions_ai,
    evaluate_interview_answer_ai,
)
from ai_services.youtube_discovery import find_videos_for_topic

app = FastAPI(title="SkillMeter.Ai AI Orchestrator Microservice", version="1.0.0")

# Enable CORS for Next.js (port 3000) and Django (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class RoadmapRequest(BaseModel):
    goal: str
    skill_level: str
    hours_per_week: int

class NotesRequest(BaseModel):
    topic: str

class QuizRequest(BaseModel):
    topic: str

class QuestionsRequest(BaseModel):
    topic: str
    difficulty: str
    count: Optional[int] = 5

class EvaluateRequest(BaseModel):
    question: str
    answer: str
    topic: str

# Endpoints
@app.post("/api/ai/generate-roadmap")
def api_generate_roadmap(req: RoadmapRequest):
    try:
        data = generate_roadmap_ai(req.goal, req.skill_level, req.hours_per_week)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/generate-notes")
def api_generate_notes(req: NotesRequest):
    try:
        notes = generate_notes_ai(req.topic)
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/generate-quiz")
def api_generate_quiz(req: QuizRequest):
    try:
        quiz = generate_quiz_ai(req.topic)
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/youtube-discovery")
def api_youtube_discovery(topic: str, max_results: Optional[int] = 3, context: Optional[str] = None):
    try:
        videos = find_videos_for_topic(topic, max_results, context)
        return videos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/interview/generate-questions")
def api_generate_questions(req: QuestionsRequest):
    try:
        questions = generate_interview_questions_ai(req.topic, req.difficulty, req.count)
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/interview/evaluate-answer")
def api_evaluate_answer(req: EvaluateRequest):
    try:
        evaluation = evaluate_interview_answer_ai(req.question, req.answer, req.topic)
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "ok", "service": "SkillMeter.Ai AI Orchestrator"}
