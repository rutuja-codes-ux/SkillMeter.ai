"use client";

import React, { useState, useEffect, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  BookOpen,
  Video,
  FileText,
  CheckSquare,
  Play,
  CheckCircle,
  Copy,
  Printer,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function LearningPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const searchParams = useSearchParams();
  const router = useRouter();

  // Navigation & lessons state
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  // Tabs state: "video", "notes", "quiz"
  const [activeTab, setActiveTab] = useState("video");

  // AI Notes state
  const [notes, setNotes] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesCache, setNotesCache] = useState<Record<string, string>>({});

  // AI Quiz state
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizCache, setQuizCache] = useState<Record<string, any[]>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // UI state
  const [actionLoading, setActionLoading] = useState(false);
  const [xpNotification, setXpNotification] = useState("");

  // Load Course and Lessons list
  useEffect(() => {
    async function loadCourse() {
      try {
        setLoadingLessons(true);
        // Load details of the course (enrolled roadmap)
        const details = await api.getCourseDetail(Number(courseId));
        setCourseTitle(details.title);
        setProgressPercent(details.progress_percent);

        // Load the list of subtopics (lessons)
        const lessonList = await api.getCourseLessons(Number(courseId));
        setLessons(lessonList);

        if (lessonList.length > 0) {
          // If a query parameter specifies ?lesson=..., use that. Otherwise default to first
          const queryLessonId = searchParams.get("lesson");
          const defaultLesson = queryLessonId
            ? lessonList.find((l: any) => l.id === queryLessonId)
            : lessonList[0];
          
          handleSelectLesson(defaultLesson || lessonList[0]);
        }
      } catch (err) {
        console.error("Failed to load course details", err);
      } finally {
        setLoadingLessons(false);
      }
    }
    loadCourse();
  }, [courseId, searchParams]);

  // Select lesson handler
  const handleSelectLesson = (lesson: any) => {
    setActiveLesson(lesson);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizScore(0);
    setActiveTab("video");
  };

  // Trigger Notes retrieval
  useEffect(() => {
    if (activeTab === "notes" && activeLesson) {
      const topic = activeLesson.title;
      if (notesCache[topic]) {
        setNotes(notesCache[topic]);
      } else {
        fetchNotes(topic);
      }
    }
  }, [activeTab, activeLesson]);

  async function fetchNotes(topic: string) {
    try {
      setLoadingNotes(true);
      setNotes("");
      const res = await api.generateAINotes(topic);
      if (res && res.notes) {
        setNotes(res.notes);
        setNotesCache((prev) => ({ ...prev, [topic]: res.notes }));
      }
    } catch (err) {
      console.error(err);
      setNotes("Failed to load AI Notes. Please try again.");
    } finally {
      setLoadingNotes(false);
    }
  }

  // Trigger Quiz retrieval
  useEffect(() => {
    if (activeTab === "quiz" && activeLesson) {
      const topic = activeLesson.title;
      if (quizCache[topic]) {
        setQuizQuestions(quizCache[topic]);
      } else {
        fetchQuiz(topic);
      }
    }
  }, [activeTab, activeLesson]);

  async function fetchQuiz(topic: string) {
    try {
      setLoadingQuiz(true);
      setQuizQuestions([]);
      const res = await api.generateAIQuiz(topic);
      if (res && res.questions) {
        setQuizQuestions(res.questions);
        setQuizCache((prev) => ({ ...prev, [topic]: res.questions }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuiz(false);
    }
  }

  // Complete Lesson handler
  const handleCompleteLesson = async () => {
    if (!activeLesson || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await api.completeLesson(activeLesson.id);
      
      setLessons(
        lessons.map((l) =>
          l.id === activeLesson.id ? { ...l, status: "completed" } : l
        )
      );
      setActiveLesson({ ...activeLesson, status: "completed" });
      setProgressPercent(res.progress_percent);
      
      setXpNotification(`+${res.xp_earned} XP Earned! Streak is now ${res.streak_days} days.`);
      setTimeout(() => setXpNotification(""), 4000);

      const cached = localStorage.getItem("user_profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.profile) {
          parsed.profile.xp_points = res.new_xp;
          parsed.profile.streak_days = res.streak_days;
          if (res.progress_percent >= 100) {
            parsed.profile.badge_count += 1;
          }
          localStorage.setItem("user_profile", JSON.stringify(parsed));
        }
      }
    } catch (err: any) {
      console.error("Completion error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Quiz Answers scoring
  const handleQuizSubmit = async () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    try {
      await api.submitQuiz({
        topic: activeLesson.title,
        score: score,
        total_questions: quizQuestions.length,
      });

      if (score >= 4) {
        setXpNotification(`Passed! +25 XP Quiz Bonus!`);
        setTimeout(() => setXpNotification(""), 4000);
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
    }
  };

  const copyNotesToClipboard = () => {
    navigator.clipboard.writeText(notes);
    alert("Study notes copied to clipboard!");
  };

  const printNotes = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Study Notes: ${activeLesson?.title}</title>
            <style>
              body { font-family: sans-serif; line-height: 1.6; padding: 40px; color: #000000; background: #ffffff; }
              h1 { font-family: sans-serif; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000000; padding-bottom: 10px; }
              pre { background: #f3f4f6; padding: 15px; border: 1px solid #000000; overflow-x: auto; }
              code { font-family: monospace; font-size: 14px; }
            </style>
          </head>
          <body>
            <h1>${activeLesson?.title} — Study Notes</h1>
            <div style="white-space: pre-line;">${notes}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loadingLessons) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-black border-t-transparent animate-spin rounded-none" />
        <p className="mt-4 font-bold text-xs text-black tracking-wider uppercase">Configuring Course player...</p>
      </div>
    );
  }

  // Get active video URL
  const activeVideo = activeLesson?.videos?.[0];
  const videoEmbedUrl = activeVideo
    ? `https://www.youtube.com/embed/${activeVideo.video_id}`
    : null;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 relative">
      
      {/* XP Toast Notification - Swiss Brutalist style overlay */}
      {xpNotification && (
        <div className="fixed top-6 right-6 z-50 bg-white text-black px-6 py-4 rounded-none shadow-brutal border-2 border-black font-black flex items-center gap-3">
          <Sparkles className="w-5 h-5" />
          <span className="uppercase text-xs tracking-wider">{xpNotification}</span>
        </div>
      )}

      {/* Left panel: Lessons Sidebar */}
      <div className="lg:w-80 shrink-0 bg-white border border-black rounded-none p-4 h-[calc(100vh-140px)] overflow-y-auto space-y-4">
        <div>
          <h3 className="font-black text-xs uppercase tracking-wide text-black truncate">{courseTitle}</h3>
          <div className="flex items-center justify-between text-[9px] text-neutral-500 font-black uppercase mt-2 tracking-wider">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-neutral-100 h-3 border border-black rounded-none overflow-hidden mt-1.5">
            <div className="bg-black h-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <hr className="border-black opacity-10" />

        <div className="space-y-2">
          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block px-2">Roadmap Syllabus</span>
          
          <div className="space-y-1">
            {lessons.map((les) => {
              const isActive = activeLesson?.id === les.id;
              const isCompleted = les.status === "completed";
              return (
                <button
                  key={les.id}
                  onClick={() => handleSelectLesson(les)}
                  className={`w-full text-left px-3 py-3 rounded-none text-xs font-bold flex items-start gap-2.5 transition-all ${
                    isActive
                      ? "bg-black text-white border border-black"
                      : "text-black border border-transparent hover:bg-neutral-50"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-black"}`} />
                    ) : (
                      <Play className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-neutral-400"}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate leading-tight uppercase text-[11px] tracking-wide">{les.title}</span>
                    <span className={`text-[8px] font-black block mt-0.5 uppercase tracking-wider ${isActive ? "text-neutral-400" : "text-neutral-500"}`}>
                      {les.phase_title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel: Tabbed Area */}
      <div className="flex-1 flex flex-col bg-white border border-black rounded-none overflow-hidden h-[calc(100vh-140px)]">
        
        {/* Navigation Tabs Header */}
        <div className="bg-neutral-50 border-b border-black px-6 flex justify-between items-center shrink-0">
          <div className="flex gap-2">
            {[
              { id: "video", label: "Video Player", icon: Video },
              { id: "notes", label: "AI Study Notes", icon: FileText },
              { id: "quiz", label: "Knowledge Check", icon: CheckSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-4 px-3 text-[10px] uppercase tracking-wider font-black transition-all border-b-2 rounded-none ${
                    isActive
                      ? "border-black text-black"
                      : "border-transparent text-neutral-500 hover:text-black"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeLesson && activeLesson.status !== "completed" && (
            <button
              onClick={handleCompleteLesson}
              disabled={actionLoading}
              className="bg-black text-white hover:bg-neutral-800 border border-black text-[9px] uppercase tracking-widest font-black px-4 py-2 rounded-none transition-colors disabled:opacity-50"
            >
              {actionLoading ? "Completing..." : "Complete Lesson"}
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeLesson ? (
            <>
              {/* Tab 1: Video */}
              {activeTab === "video" && (
                <div className="space-y-6">
                  {videoEmbedUrl ? (
                    <div className="aspect-video w-full rounded-none overflow-hidden border border-black bg-black relative">
                      <iframe
                        src={videoEmbedUrl}
                        title={activeLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-none bg-neutral-50 flex flex-col items-center justify-center text-center p-6 border border-black">
                      <Video className="w-12 h-12 text-black mb-4" />
                      <h4 className="font-black text-xs uppercase tracking-wider text-black">No video source attached</h4>
                      <p className="text-[11px] text-neutral-500 max-w-sm mt-1 font-semibold">
                        Use the complete lesson button above to log XP or review study notes.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-tight text-black">{activeLesson.title}</h2>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                      Sourced by AI. Est. completion: {activeLesson.estimated_hours} hours.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: AI Study Notes */}
              {activeTab === "notes" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-black pb-3">
                    <h3 className="font-black text-xs uppercase tracking-widest text-black flex items-center gap-2">
                      📚 Lecture Notes
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={copyNotesToClipboard}
                        disabled={loadingNotes || !notes}
                        className="border border-black hover:bg-neutral-50 p-2 rounded-none text-black disabled:opacity-40"
                        title="Copy to Clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={printNotes}
                        disabled={loadingNotes || !notes}
                        className="border border-black hover:bg-neutral-50 p-2 rounded-none text-black disabled:opacity-40"
                        title="Print / Save PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {loadingNotes ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin rounded-none" />
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider animate-pulse">Gemini is synthesizing notes...</p>
                    </div>
                  ) : (
                    <div className="max-w-none text-xs text-black leading-relaxed space-y-4 whitespace-pre-line bg-neutral-50 p-6 border border-black rounded-none font-medium">
                      {notes}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Knowledge Check */}
              {activeTab === "quiz" && (
                <div className="space-y-6">
                  <div className="border-b border-black pb-3 flex justify-between items-center">
                    <h3 className="font-black text-xs uppercase tracking-widest text-black">
                      📝 Assessment: 5 MCQs
                    </h3>
                    {quizSubmitted && (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 border border-black rounded-none ${
                        quizScore >= 4 ? "bg-neutral-100 text-black" : "bg-neutral-50 text-neutral-500"
                      }`}>
                        Score: {quizScore} / 5
                      </span>
                    )}
                  </div>

                  {loadingQuiz ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin rounded-none" />
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider animate-pulse">Formulating test questions...</p>
                    </div>
                  ) : quizQuestions.length > 0 ? (
                    <div className="space-y-6">
                      {quizQuestions.map((q, idx) => (
                        <div key={q.id} className="space-y-3">
                          <h4 className="font-black text-xs text-black uppercase tracking-wide">
                            Q{idx + 1}. {q.question}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isSelected = selectedAnswers[q.id] === optIdx;
                              const isCorrect = q.correct_answer === optIdx;
                              
                              let btnClass = "border border-black bg-white hover:bg-neutral-50 text-black";
                              if (quizSubmitted) {
                                if (isCorrect) {
                                  btnClass = "bg-neutral-100 border-2 border-black text-black font-black";
                                } else if (isSelected) {
                                  btnClass = "bg-neutral-50 border border-neutral-300 text-neutral-400 line-through";
                                } else {
                                  btnClass = "opacity-40 border-neutral-200 text-neutral-400 bg-white";
                                }
                              } else if (isSelected) {
                                btnClass = "border-2 border-black bg-neutral-100 text-black font-black";
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={quizSubmitted}
                                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                                  className={`p-3 rounded-none text-left text-xs transition-all font-semibold ${btnClass}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {!quizSubmitted ? (
                        <button
                          onClick={handleQuizSubmit}
                          disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                          className="w-full bg-black text-white hover:bg-neutral-800 py-3 rounded-none font-black text-xs uppercase tracking-widest border border-black disabled:opacity-40 mt-4"
                        >
                          Submit Quiz Answers
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setQuizSubmitted(false);
                            setSelectedAnswers({});
                            fetchQuiz(activeLesson.title);
                          }}
                          className="w-full border border-black hover:bg-neutral-50 py-3 rounded-none font-black text-xs text-black uppercase tracking-widest mt-4 bg-white"
                        >
                          Retake Quiz
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-neutral-500 italic">
                      Quiz content is unavailable. Try again.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-xs text-neutral-500 uppercase font-bold tracking-wider">
              Please select a lesson from the syllabus sidebar.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
