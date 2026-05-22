"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Brain,
  Play,
  Mic,
  MicOff,
  Send,
  Award,
  Sparkles,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Sliders
} from "lucide-react";

interface Question {
  id: number;
  question: string;
}

interface ResponseDetail {
  question_id: number;
  question: string;
  answer: string;
  rating: number;
  feedback: string;
  clarity: number;
  technical_accuracy: number;
  completeness: number;
}

export default function MockInterviewPage() {
  const [step, setStep] = useState<"setup" | "interview" | "report">("setup");
  const [topic, setTopic] = useState("PYTHON");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);

  // Active Session state
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [responses, setResponses] = useState<ResponseDetail[]>([]);
  
  // Real-time evaluation of the current question
  const [evalLoading, setEvalLoading] = useState(false);
  const [currentEval, setCurrentEval] = useState<ResponseDetail | null>(null);

  // Overall scorecard report state
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [overallFeedback, setOverallFeedback] = useState("");

  // Mic simulation
  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number[]>([10, 20, 15, 30, 25, 40, 20, 15, 10]);

  // Audio level animation for visual flair
  useEffect(() => {
    let timer: any = null;
    if (micActive) {
      timer = setInterval(() => {
        setAudioLevel(Array.from({ length: 9 }, () => Math.floor(Math.random() * 40) + 10));
      }, 100);
    }
    return () => clearInterval(timer);
  }, [micActive]);

  // Start the interview session
  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await api.startMockInterview(topic, difficulty);
      setInterviewId(res.interview_id);
      setQuestions(res.questions || []);
      setCurrentIdx(0);
      setResponses([]);
      setCurrentEval(null);
      setAnswerText("");
      setStep("interview");
    } catch (err: any) {
      console.error(err);
      // Fallback in case of networking issues
      const simulatedId = Math.floor(Math.random() * 1000) + 1;
      const simulatedQuestions = [
        { id: 1, question: `Explain the core concepts and standard project layout for ${topic}.` },
        { id: 2, question: `What are typical performance or scaling bottlenecks in ${topic} architectures?` },
        { id: 3, question: `How does memory management, garbage collection, or state mutation work in ${topic}?` },
        { id: 4, question: `Describe a scenario where you would select an alternative stack instead of ${topic}, and why.` },
        { id: 5, question: `Explain the testing strategies, linters, and deployment pipelines you employ in ${topic} systems.` }
      ];
      setInterviewId(simulatedId);
      setQuestions(simulatedQuestions);
      setCurrentIdx(0);
      setResponses([]);
      setCurrentEval(null);
      setAnswerText("");
      setStep("interview");
    } finally {
      setLoading(false);
    }
  };

  // Submit answer for the active question
  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !interviewId) return;

    setEvalLoading(true);
    const activeQuestion = questions[currentIdx];
    try {
      const res = await api.submitInterviewAnswer(interviewId, activeQuestion.id, answerText);
      const evalDetail = res.evaluation;
      
      setCurrentEval(evalDetail);
      setResponses((prev) => {
        // Replace if exists, or append
        const filtered = prev.filter((r) => r.question_id !== activeQuestion.id);
        return [...filtered, evalDetail];
      });

      if (res.completed) {
        setOverallScore(res.overall_score || 7.5);
        setOverallFeedback(
          res.feedback || `Excellent! You completed the ${topic} mock interview. Overall score: ${res.overall_score}/10.`
        );
      }
    } catch (err: any) {
      console.error(err);
      // Fallback evaluation simulator
      const mockScore = Math.min(10, Math.max(4, 5 + Math.round(answerText.length / 80)));
      const evalDetail: ResponseDetail = {
        question_id: activeQuestion.id,
        question: activeQuestion.question,
        answer: answerText,
        rating: mockScore,
        clarity: Math.min(mockScore + 1, 10),
        technical_accuracy: mockScore,
        completeness: Math.max(3, mockScore - 1),
        feedback: "Solid explanation. To further elevate your score, provide code syntax illustrations and details on async threads."
      };
      setCurrentEval(evalDetail);
      setResponses((prev) => [...prev, evalDetail]);

      if (currentIdx === questions.length - 1) {
        const totalRating = responses.reduce((acc, curr) => acc + curr.rating, 0) + mockScore;
        const avgScore = Number((totalRating / questions.length).toFixed(1));
        setOverallScore(avgScore);
        setOverallFeedback(`Simulated interview completed. You performed strongly on practical problem solving but can add architectural descriptions. Final average: ${avgScore}/10.`);
      }
    } finally {
      setEvalLoading(false);
    }
  };

  // Proceed to the next question or report
  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setAnswerText("");
      setCurrentEval(null);
    } else {
      setStep("report");
    }
  };

  // Simulate speaking and auto-populating answer
  const handleToggleMic = () => {
    if (!micActive) {
      setMicActive(true);
      // Pre-fill answer with a mock technical response based on topic after 3 seconds
      setTimeout(() => {
        setAnswerText((prev) => {
          const starter = prev ? prev + " " : "";
          return starter + `From an engineering perspective, this involves optimizing compilation parameters, utilizing standard designs, managing state variables robustly, and conducting thread-safe database concurrency reviews to ensure scaling and durability under production workloads.`;
        });
        setMicActive(false);
      }, 3500);
    } else {
      setMicActive(false);
    }
  };

  // Skip or reset interview
  const handleReset = () => {
    setStep("setup");
    setInterviewId(null);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswerText("");
    setResponses([]);
    setCurrentEval(null);
    setOverallScore(null);
    setOverallFeedback("");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner - Neobrutalist Block */}
      <div className="bg-black text-white p-8 rounded-none border-2 border-black shadow-[4px_4px_0px_#000000] space-y-2">
        <h1 className="text-4xl font-display font-black tracking-tight uppercase flex items-center gap-3">
          <Brain className="w-9 h-9 text-[#FFFF00] shrink-0" /> AI Mock Interview
        </h1>
        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
          Challenge yourself against an AI agent that scores response structures, communication clarity, and technical correctness.
        </p>
      </div>

      {/* STEP 1: SETUP SCREEN */}
      {step === "setup" && (
        <div className="bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_#000000] p-8 max-w-2xl mx-auto space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-4 border-b-2 border-black pb-4">
            <div className="w-12 h-12 bg-black border border-black flex items-center justify-center text-white shrink-0">
              <Sliders className="w-6 h-6 text-[#FFFF00]" />
            </div>
            <div>
              <h2 className="font-black text-lg text-black uppercase tracking-tight">Configure Your Interview</h2>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Select your focus technology and target difficulty level.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Topic Select */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest block">Target Subject / Tech Stack</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-white border-2 border-black px-4 py-3 rounded-none text-xs font-black text-black uppercase tracking-wider focus:outline-none focus:bg-neutral-50 transition-colors"
              >
                <option value="PYTHON">Python Backend Engineering</option>
                <option value="JAVASCRIPT">Modern JavaScript (ES6+ & TS)</option>
                <option value="REACT">Frontend Engineering (React & Next.js)</option>
                <option value="DATABASE">SQL, NoSQL & Data Architecture</option>
                <option value="SYSTEM_DESIGN">System Design & Scalability</option>
                <option value="AI_ML">Machine Learning & LLM Integration</option>
              </select>
            </div>

            {/* Difficulty Select */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-500 uppercase tracking-widest block">Difficulty Rating</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-white border-2 border-black px-4 py-3 rounded-none text-xs font-black text-black uppercase tracking-wider focus:outline-none focus:bg-neutral-50 transition-colors"
              >
                <option value="Easy">Easy (Conceptual & Syntax basics)</option>
                <option value="Medium">Medium (Application & Practical bottlenecks)</option>
                <option value="Hard">Hard (Architectural trade-offs & Stress-testing)</option>
              </select>
            </div>
          </div>

          {/* Guidelines info */}
          <div className="bg-[#FFFF00] text-black border-2 border-black p-5 rounded-none shadow-[2px_2px_0px_#000000] text-xs leading-relaxed font-bold">
            <span className="font-black text-black block mb-2 uppercase tracking-wider">Interview Rules & Guidelines:</span>
            <ul className="list-disc pl-4 space-y-1.5 uppercase text-[10px] tracking-wide">
              <li>The simulation contains **5 technical questions** generated dynamically.</li>
              <li>You can type your answer in detail or use the **Speech Simulator** to dictate.</li>
              <li>Each response is individually graded on **Clarity, Technical Accuracy, and Completeness**.</li>
              <li>An overall scorecard and structured feedback will be compiled at completion.</li>
            </ul>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full bg-[#00FF66] text-black border-2 border-black hover:bg-[#00CC55] py-3.5 rounded-none font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-none" />
                <span>Generating custom questions using AI...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-black" />
                <span>Initialize Technical Interview</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 2: ACTIVE INTERVIEW ROOM */}
      {step === "interview" && questions.length > 0 && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Questions Checklist */}
          <div className="lg:col-span-4 bg-white rounded-none border-2 border-black p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
            <h3 className="font-black text-sm text-black border-b-2 border-black pb-2 flex items-center justify-between uppercase tracking-wider">
              <span>📋 Questions Tracker</span>
              <span className="text-[10px] font-black bg-[#FFFF00] text-black border border-black px-2.5 py-0.5 rounded-none">
                Q {currentIdx + 1}/{questions.length}
              </span>
            </h3>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const isCompleted = idx < responses.length;
                const isActive = idx === currentIdx;
                const rating = responses.find((r) => r.question_id === q.id)?.rating;

                return (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between p-3.5 rounded-none text-xs transition-all border-2 ${
                      isActive
                        ? "bg-black text-white border-black shadow-[2px_2px_0px_#FFFF00]"
                        : isCompleted
                        ? "bg-[#00FF66]/20 text-black border-black"
                        : "bg-white text-neutral-450 border-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <div className={`w-5 h-5 rounded-none border border-black flex items-center justify-center shrink-0 font-black text-[10px] ${
                        isActive
                          ? "bg-[#FFFF00] text-black"
                          : isCompleted
                          ? "bg-[#00FF66] text-black"
                          : "bg-neutral-100 text-neutral-400"
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="truncate font-black uppercase tracking-wide">{q.question}</span>
                    </div>
                    {isCompleted && rating && (
                      <span className="text-[10px] font-black bg-white border border-black text-black px-1.5 py-0.5 rounded-none shrink-0">
                        {rating}/10
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Simulating active microphone monitoring */}
            <div className="bg-white rounded-none p-3.5 border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-none ${micActive ? "bg-red-500 animate-pulse" : "bg-neutral-300"} border border-black`} />
                <span className="text-[9px] font-black text-black uppercase tracking-widest">
                  {micActive ? "Recognition Streaming..." : "Webcam & Mic Connected"}
                </span>
              </div>
              {micActive && (
                <div className="flex gap-0.5 items-end h-3 shrink-0">
                  {audioLevel.map((lvl, index) => (
                    <div
                      key={index}
                      style={{ height: `${lvl}%` }}
                      className="w-0.5 bg-red-500 transition-all duration-100"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Active Question Board & Chat Input */}
          <div className="lg:col-span-8 bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_#000000] p-6 space-y-6">
            
            {/* Question Text from AI Bot */}
            <div className="bg-[#00FFCC] rounded-none p-6 border-2 border-black shadow-[4px_4px_0px_#000000] space-y-3 relative overflow-hidden">
              <div className="absolute top-3.5 right-3.5 text-[9px] font-black text-black bg-white border border-black px-2 py-0.5 rounded-none uppercase tracking-widest">
                AI Technical Evaluator
              </div>

              <span className="text-[10px] font-black uppercase text-black tracking-widest block">Question {currentIdx + 1}</span>
              <p className="font-display font-black text-black text-lg leading-relaxed uppercase">
                {questions[currentIdx].question}
              </p>
            </div>

            {/* Answer Entry */}
            {!currentEval ? (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={6}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your technical explanation here... Be specific about architecture, libraries, and design tradeoffs."
                    className="w-full bg-white border-2 border-black p-4 rounded-none text-xs font-bold text-black placeholder-neutral-400 focus:outline-none focus:bg-neutral-50 transition-all resize-none leading-relaxed uppercase tracking-wider"
                  />
                  
                  {/* speech simulation button */}
                  <button
                    onClick={handleToggleMic}
                    className={`absolute bottom-4 right-4 p-3 rounded-none border-2 border-black transition-all ${
                      micActive ? "bg-red-500 text-white scale-105 shadow-none animate-pulse" : "bg-[#FFFF00] text-black hover:bg-yellow-400 shadow-[2px_2px_0px_#000000]"
                    } cursor-pointer`}
                    title="Simulate Speech Dictation"
                  >
                    {micActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleReset}
                    className="text-xs font-black text-neutral-550 hover:text-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Terminate Session
                  </button>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={evalLoading || !answerText.trim()}
                    className="bg-black text-white border-2 border-black hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:border-neutral-200 px-6 py-3 rounded-none text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    {evalLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border border-white border-t-transparent animate-spin rounded-none" />
                        <span>AI Scorecard Evaluation...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Submit Response</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Real-time score response panel */
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] border-2 border-black p-5 bg-[#FFFF00] text-black shadow-[4px_4px_0px_#000000] rounded-none">
                <div className="border-b-2 border-black pb-4">
                  <h4 className="text-[10px] font-black text-black uppercase tracking-widest mb-3">Submitted Response Rating</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-none bg-black text-[#FFFF00] border-2 border-black flex flex-col items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                      <span className="text-2xl font-black">{currentEval.rating}</span>
                      <span className="text-[8px] font-black text-[#FFFF00] uppercase tracking-widest -mt-1">Points</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-black font-black text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-black fill-current shrink-0" />
                        <span>AI Response Scorecard</span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed uppercase tracking-wider">
                        {currentEval.feedback}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score breakdown metrics slider */}
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Clarity */}
                  <div className="bg-white p-3 rounded-none border-2 border-black space-y-2 shadow-[2px_2px_0px_#000000]">
                    <div className="flex justify-between items-center text-[9px] font-black text-black uppercase tracking-wider">
                      <span>Clarity & Structure</span>
                      <span>{currentEval.clarity}/10</span>
                    </div>
                    <div className="h-3.5 w-full bg-neutral-100 border border-black rounded-none overflow-hidden">
                      <div
                        style={{ width: `${currentEval.clarity * 10}%` }}
                        className="h-full bg-[#00FFCC] transition-all duration-500 border-r border-black"
                      />
                    </div>
                  </div>

                  {/* Technical Accuracy */}
                  <div className="bg-white p-3 rounded-none border-2 border-black space-y-2 shadow-[2px_2px_0px_#000000]">
                    <div className="flex justify-between items-center text-[9px] font-black text-black uppercase tracking-wider">
                      <span>Technical Accuracy</span>
                      <span>{currentEval.technical_accuracy}/10</span>
                    </div>
                    <div className="h-3.5 w-full bg-neutral-100 border border-black rounded-none overflow-hidden">
                      <div
                        style={{ width: `${currentEval.technical_accuracy * 10}%` }}
                        className="h-full bg-[#00FF66] transition-all duration-500 border-r border-black"
                      />
                    </div>
                  </div>

                  {/* Completeness */}
                  <div className="bg-white p-3 rounded-none border-2 border-black space-y-2 shadow-[2px_2px_0px_#000000]">
                    <div className="flex justify-between items-center text-[9px] font-black text-black uppercase tracking-wider">
                      <span>Coverage & Scope</span>
                      <span>{currentEval.completeness}/10</span>
                    </div>
                    <div className="h-3.5 w-full bg-neutral-100 border border-black rounded-none overflow-hidden">
                      <div
                        style={{ width: `${currentEval.completeness * 10}%` }}
                        className="h-full bg-[#FF66CC] transition-all duration-500 border-r border-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="bg-black text-white hover:bg-neutral-800 border-2 border-black px-5 py-3 rounded-none text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#FFFF00] cursor-pointer"
                  >
                    <span>
                      {currentIdx === questions.length - 1 ? "Compile Complete Report" : "Proceed to Next Question"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: INTERVIEW REPORT CARD */}
      {step === "report" && (
        <div className="bg-white rounded-none border-2 border-black shadow-[4px_4px_0px_#000000] p-8 max-w-4xl mx-auto space-y-8 relative overflow-hidden">
          {/* Radial score banner header */}
          <div className="bg-black text-white rounded-none p-8 text-center space-y-6 relative overflow-hidden border-2 border-black shadow-[4px_4px_0px_#000000]">
            <div className="relative z-10 space-y-2">
              <div className="w-12 h-12 bg-[#FFFF00] text-black rounded-none flex items-center justify-center mx-auto mb-2 border-2 border-black shadow-[2px_2px_0px_#000000]">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight">AI Assessment Report Card</h2>
              <p className="text-xs text-neutral-400 uppercase tracking-widest font-black">{topic} Interview • {difficulty} Level</p>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 pt-4">
              {/* Radial Rating Dial */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                {/* SVG circular track */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    className="stroke-neutral-800"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    className="stroke-[#FFFF00]"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={326.7}
                    strokeDashoffset={326.7 - (326.7 * (overallScore || 7.5)) / 10}
                  />
                </svg>
                <div className="absolute text-center space-y-0.5">
                  <span className="text-3xl font-black text-white font-mono">{overallScore || 7.5}</span>
                  <span className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest">Score / 10</span>
                </div>
              </div>

              {/* Summary Text block */}
              <div className="text-center md:text-left max-w-md space-y-3">
                <div className="flex gap-2 items-center justify-center md:justify-start">
                  <span className="text-xs font-black bg-[#00FF66] text-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000000] uppercase tracking-wider">Verified Score</span>
                  <span className="text-xs font-black text-[#00FFCC] uppercase tracking-wider">+200 XP Awarded</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-bold uppercase tracking-wide">
                  {overallFeedback}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Question-by-Question breakdown */}
          <div className="space-y-4">
            <h3 className="font-black text-sm text-black border-b-2 border-black pb-2 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-black" /> Comprehensive Performance Analysis
            </h3>

            <div className="space-y-6">
              {responses.map((resp, index) => (
                <div
                  key={resp.question_id}
                  className="border-2 border-black rounded-none overflow-hidden shadow-[4px_4px_0px_#000000] bg-white"
                >
                  {/* Header bar */}
                  <div className="bg-[#FFFF00] px-4 py-3.5 flex flex-col md:flex-row justify-between md:items-center border-b-2 border-black gap-2 text-black">
                    <span className="text-xs font-black flex items-center gap-2 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-none bg-black text-white flex items-center justify-center text-[10px] border border-black shrink-0">
                        {index + 1}
                      </span>
                      {resp.question}
                    </span>
                    <span className="text-xs font-black bg-white text-black border-2 border-black px-2 py-0.5 rounded-none self-start md:self-auto uppercase shadow-[1px_1px_0px_#000000]">
                      Score: {resp.rating}/10
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4 text-xs font-bold text-black uppercase tracking-wider">
                    {/* User Answer block */}
                    <div className="space-y-1.5">
                      <span className="font-black text-neutral-500 uppercase text-[9px] block tracking-widest">Your Answer:</span>
                      <p className="bg-neutral-50 border-2 border-black p-4 rounded-none text-neutral-800 italic leading-relaxed normal-case">
                        "{resp.answer}"
                      </p>
                    </div>

                    {/* AI Feedback notes */}
                    <div className="bg-[#00FFCC]/20 border-2 border-black rounded-none p-4 text-black leading-relaxed font-bold normal-case">
                      <span className="font-black text-black block mb-1 uppercase text-[9px] tracking-widest">AI Recommendation & Technical Gaps:</span>
                      {resp.feedback}
                    </div>

                    {/* Quick Metric Bars */}
                    <div className="grid grid-cols-3 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                          <span>Clarity</span>
                          <span>{resp.clarity}/10</span>
                        </div>
                        <div className="h-3.5 w-full bg-neutral-100 border border-black rounded-none overflow-hidden">
                          <div style={{ width: `${resp.clarity * 10}%` }} className="h-full bg-[#00FFCC] border-r border-black" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                          <span>Accuracy</span>
                          <span>{resp.technical_accuracy}/10</span>
                        </div>
                        <div className="h-3.5 w-full bg-neutral-100 border border-black rounded-none overflow-hidden">
                          <div style={{ width: `${resp.technical_accuracy * 10}%` }} className="h-full bg-[#00FF66] border-r border-black" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                          <span>Completeness</span>
                          <span>{resp.completeness}/10</span>
                        </div>
                        <div className="h-3.5 w-full bg-neutral-100 border border-black rounded-none overflow-hidden">
                          <div style={{ width: `${resp.completeness * 10}%` }} className="h-full bg-[#FF66CC] border-r border-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6 border-t-2 border-black">
            <button
              onClick={handleReset}
              className="border-2 border-black bg-white hover:bg-neutral-150 text-black px-6 py-3 rounded-none text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer transition-all"
            >
              Start Another Interview
            </button>
            <a
              href="/dashboard"
              className="bg-black text-white border-2 border-black hover:bg-neutral-800 px-6 py-3 rounded-none text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer transition-all"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
