"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Map,
  Plus,
  Play,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function RoadmapPage() {
  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [hours, setHours] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  // Roadmaps state
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Collapse state for phases
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadRoadmaps();
  }, []);

  async function loadRoadmaps() {
    try {
      const data = await api.getRoadmaps();
      setRoadmaps(data);
      if (data && data.length > 0) {
        setSelectedRoadmap(data[0]); // default to first
        // Expand all phases by default
        const expandMap: Record<number, boolean> = {};
        data[0].phases.forEach((p: any) => {
          expandMap[p.phase_number] = true;
        });
        setExpandedPhases(expandMap);
        setShowWizard(false);
      } else {
        setShowWizard(true);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch roadmaps.");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateRoadmap = async () => {
    if (!goal.trim()) return;
    setGenerating(true);
    setStep(4);
    
    const msgs = [
      "Consulting AI Orchestrator...",
      "Analyzing YouTube educational catalog...",
      "Extracting best video tutorials...",
      "Structuring daily learning milestones...",
      "Generating localized concept test questions...",
    ];
    let i = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => {
      i = (i + 1) % msgs.length;
      setLoadingMsg(msgs[i]);
    }, 2000);

    try {
      await api.generateRoadmap({
        goal,
        skill_level: skillLevel,
        hours_per_week: hours,
      });
      clearInterval(interval);
      await loadRoadmaps();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Roadmap generation failed.");
      setGenerating(false);
      setStep(1);
    }
  };

  const togglePhase = (phaseNum: number) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseNum]: !prev[phaseNum],
    }));
  };

  const handleSelectRoadmap = (id: number) => {
    const found = roadmaps.find((r) => r.id === id);
    if (found) {
      setSelectedRoadmap(found);
      const expandMap: Record<number, boolean> = {};
      found.phases.forEach((p: any) => {
        expandMap[p.phase_number] = true;
      });
      setExpandedPhases(expandMap);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-black border-t-transparent animate-spin rounded-none" />
        <p className="mt-4 font-bold text-xs text-black tracking-wider uppercase">Loading Roadmaps...</p>
      </div>
    );
  }

  const goalSuggestions = [
    "Full-Stack Web Development with React & Node",
    "Machine Learning & Data Science Foundations",
    "DevOps and AWS Cloud Infrastructure",
    "Data Structures and Algorithms in Java",
    "Rust System Programming & Performance Tuning",
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-black flex items-center gap-2 uppercase tracking-tight">
            <Map className="w-7 h-7" /> AI Learning Roadmaps
          </h1>
          <p className="text-xs text-neutral-500 font-bold mt-1 uppercase tracking-wider">
            Browse your custom schedules or formulate new learning paths.
          </p>
        </div>

        {roadmaps.length > 0 && !showWizard && (
          <button
            onClick={() => {
              setGoal("");
              setStep(1);
              setShowWizard(true);
            }}
            className="bg-black text-white hover:bg-neutral-800 px-4 py-2.5 border border-black rounded-none font-black text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Build New Roadmap
          </button>
        )}
      </div>

      {/* Onboarding Wizard Modal overlay or inline card */}
      {showWizard ? (
        <div className="bg-white rounded-none border border-black max-w-2xl mx-auto shadow-sm">
          <div className="bg-black text-white p-6 relative overflow-hidden">
            <h3 className="text-lg font-display font-black flex items-center gap-2 uppercase tracking-wide">
              <Sparkles className="w-5 h-5 text-white" /> AI Goal Wizard
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Specify your target and let SkillForge search the web and schedule your path.
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Step Indicators */}
            {step < 4 && (
              <div className="flex items-center justify-between max-w-sm mx-auto mb-6">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-none flex items-center justify-center text-xs font-black border transition-colors ${
                        step === num
                          ? "bg-black text-white border-black"
                          : step > num
                          ? "bg-neutral-100 text-black border-black"
                          : "bg-neutral-50 text-neutral-400 border-neutral-200"
                      }`}
                    >
                      {num}
                    </div>
                    {num < 3 && <div className={`w-8 h-0.5 ${step > num ? "bg-black" : "bg-neutral-200"}`} />}
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Goal */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block">
                    What skill do you want to master?
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-black focus:outline-none focus:bg-neutral-50 text-sm font-bold placeholder-neutral-400"
                    placeholder="e.g. React Native, Machine Learning, Rust Programming"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Suggestions:</span>
                  <div className="flex flex-wrap gap-2">
                    {goalSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setGoal(s)}
                        className="bg-neutral-50 hover:bg-neutral-100 text-black text-[11px] font-bold px-3 py-1.5 rounded-none border border-black transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    disabled={!goal.trim()}
                    onClick={() => setStep(2)}
                    className="bg-black text-white hover:bg-neutral-800 border border-black px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest flex items-center gap-2 group disabled:opacity-40"
                  >
                    Next Step <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Skill level */}
            {step === 2 && (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-black uppercase tracking-widest block">
                  Select your current expertise level:
                </label>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { id: "beginner", title: "Beginner", desc: "No coding or prior system knowledge." },
                    { id: "intermediate", title: "Intermediate", desc: "Know basic loops and syntax." },
                    { id: "advanced", title: "Advanced", desc: "Looking to optimize structure and scale." },
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSkillLevel(level.id)}
                      className={`p-4 rounded-none border text-left space-y-2 transition-all ${
                        skillLevel === level.id
                          ? "border-black bg-neutral-100"
                          : "border-neutral-200 hover:border-black bg-white"
                      }`}
                    >
                      <h4 className="font-black text-xs uppercase tracking-wider text-black">{level.title}</h4>
                      <p className="text-[11px] text-neutral-500 leading-relaxed font-semibold">{level.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="border border-black bg-white hover:bg-neutral-50 text-black px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-black text-white hover:bg-neutral-800 border border-black px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Commitment */}
            {step === 3 && (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-black uppercase tracking-widest block">
                  Select your available weekly hour commitment:
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { val: 5, label: "5 Hours", speed: "Casual Study" },
                    { val: 10, label: "10 Hours", speed: "Medium Study" },
                    { val: 15, label: "15 Hours", speed: "Fast Track" },
                    { val: 20, label: "20 Hours", speed: "Intense Boot" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setHours(item.val)}
                      className={`p-4 rounded-none border text-center space-y-1 transition-all ${
                        hours === item.val
                          ? "border-black bg-neutral-100"
                          : "border-neutral-200 hover:border-black bg-white"
                      }`}
                    >
                      <h4 className="font-black text-xs text-black">{item.label}</h4>
                      <p className="text-[9px] text-neutral-500 font-black uppercase tracking-wider">{item.speed}</p>
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="border border-black bg-white hover:bg-neutral-50 text-black px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateRoadmap}
                    className="bg-black text-white hover:bg-neutral-800 border border-black px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest"
                  >
                    Generate AI Roadmap
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Loading state */}
            {step === 4 && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-12 h-12 border-2 border-black border-t-transparent animate-spin rounded-none" />
                <div className="space-y-2">
                  <h4 className="font-black text-sm uppercase tracking-wider text-black">Assembling Learning Blueprint</h4>
                  <p className="text-xs text-black font-black uppercase tracking-widest animate-pulse">
                    {loadingMsg}
                  </p>
                </div>
                <p className="text-[11px] text-neutral-500 max-w-sm leading-relaxed font-semibold">
                  Our bot uses Gemini LLM and YouTube's data catalog to select actual programming lessons. This can take up to 10 seconds.
                </p>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* Outline view */
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left panel: Roadmap detail */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-none border border-black p-6 space-y-6">
              
              {/* Header summary of selected roadmap */}
              {selectedRoadmap && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black pb-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-tight text-black">
                      {selectedRoadmap.title}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-wider text-neutral-500">
                      <span className="flex items-center gap-1 border border-neutral-300 px-2 py-0.5">
                        Level: {selectedRoadmap.skill_level}
                      </span>
                      <span className="flex items-center gap-1 border border-neutral-300 px-2 py-0.5">
                        Duration: {selectedRoadmap.total_weeks} Weeks
                      </span>
                    </div>
                  </div>
                  
                  {/* Select other roadmap dropdown */}
                  {roadmaps.length > 1 && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-neutral-500 uppercase block tracking-wider">Select Track</label>
                      <select
                        onChange={(e) => handleSelectRoadmap(Number(e.target.value))}
                        value={selectedRoadmap.id}
                        className="bg-white border border-black px-3 py-1.5 rounded-none text-xs font-bold text-black focus:outline-none"
                      >
                        {roadmaps.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible tree of phases */}
              {selectedRoadmap?.phases && (
                <div className="space-y-6">
                  {selectedRoadmap.phases.map((phase: any, pIdx: number) => {
                    const isExpanded = expandedPhases[phase.phase_number] ?? true;
                    return (
                      <div
                        key={phase.phase_number}
                        className="border border-black rounded-none overflow-hidden"
                      >
                        {/* Phase Header */}
                        <div
                          onClick={() => togglePhase(phase.phase_number)}
                          className="bg-neutral-50 p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-100 transition-colors border-b border-black"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center font-black text-xs shrink-0 border border-black">
                              P{phase.phase_number}
                            </span>
                            <div>
                              <h4 className="font-black text-xs uppercase tracking-wider text-black">{phase.title}</h4>
                              <p className="text-[10px] text-neutral-500 mt-0.5 truncate max-w-md font-semibold">
                                {phase.description}
                              </p>
                            </div>
                          </div>
                          <button className="text-black">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Subtopics lists */}
                        {isExpanded && (
                          <div className="divide-y divide-black">
                            {phase.subtopics.map((sub: any, sIdx: number) => {
                              const isCompleted = sub.status === "completed";
                              return (
                                <div
                                  key={sub.id}
                                  className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-all text-xs"
                                >
                                  <div className="flex gap-3 items-start pr-4">
                                    <div className="mt-0.5 shrink-0 text-black">
                                      {isCompleted ? (
                                        <CheckSquare className="w-4 h-4 text-black fill-current" />
                                      ) : (
                                        <Square className="w-4 h-4 text-neutral-400" />
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      <h5 className={`font-bold text-xs uppercase tracking-wide ${isCompleted ? "line-through text-neutral-400" : "text-black"}`}>
                                        {sub.title}
                                      </h5>
                                      <div className="flex items-center gap-3 text-[9px] text-neutral-500 font-black uppercase tracking-wider">
                                        <span className="flex items-center gap-0.5">
                                          <Clock className="w-3 h-3" /> {sub.estimated_hours} hours
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                          🎬 Video Tutorial Attached
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <Link
                                    href={`/learning/${selectedRoadmap.id}?lesson=${sub.id}`}
                                    className={`shrink-0 border border-black font-black text-[9px] uppercase tracking-widest px-3.5 py-1.5 rounded-none transition-all flex items-center gap-1 group ${
                                      isCompleted
                                        ? "bg-neutral-100 text-neutral-500 border-neutral-300"
                                        : "bg-black text-white hover:bg-neutral-800"
                                    }`}
                                  >
                                    <Play className="w-3 h-3 fill-current text-white shrink-0" />
                                    <span>{isCompleted ? "Review Class" : "Start Study"}</span>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

          {/* Right panel: Active Roadmap Info statistics */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white text-black rounded-none shadow-sm p-6 border border-black">
              <h3 className="font-black text-sm uppercase tracking-wider mb-4 flex items-center gap-2 text-black">
                🤖 AI Coach Advice
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                "Our neural crawler maps YouTube classes matching your goals. Check off lessons one-by-one, compile files in the code editor, and try the focus study timer to verify competence!"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
