"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Flame,
  Trophy,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  CheckSquare,
  Square,
  Play,
  Calendar,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Target,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.getDashboard();
        setData(res);
        if (res.today_tasks) {
          setTasks(res.today_tasks);
        }
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-black border-t-transparent animate-spin rounded-none" />
        <p className="mt-4 font-bold text-xs text-black tracking-wider uppercase">Syncing Learning Logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-black p-6 rounded-none text-black my-8 max-w-xl">
        <h3 className="font-black text-lg mb-2 uppercase tracking-tight">Sync Error</h3>
        <p className="text-xs mb-4 text-neutral-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-black text-white hover:bg-neutral-800 px-4 py-2 rounded-none font-bold text-xs uppercase tracking-wider transition-colors border border-black"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const streak = data?.streak_days ?? 0;
  const bestStreak = data?.best_streak ?? 0;
  const studyHours = data?.study_time_hours ?? 0;
  const xp = data?.xp_points ?? 0;
  const badges = data?.badge_count ?? 0;
  const currentCourse = data?.current_course;
  const enrolledCourses = data?.enrolled_courses || [];
  const recentActivities = data?.recent_activity || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner - Swiss Minimalist: Stark white, thin 1px black border, solid black text */}
      <div className="bg-white text-black p-8 rounded-none border border-black relative overflow-hidden">
        {/* Subtle minimalist top grid accent lines */}
        <div className="absolute top-0 right-0 w-32 h-32 border-l border-b border-black opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-neutral-100 border border-black px-3 py-1 rounded-none text-[10px] font-black uppercase text-black tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill Gap Closed</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight uppercase leading-none">
              Hello, {data?.username || "Developer"}
            </h1>
            <p className="text-xs text-neutral-600 max-w-xl font-medium tracking-wide">
              "Every line of code written and concept checked bridges the talent gap. Let's make today count!"
            </p>
          </div>
          <Link
            href="/roadmap"
            className="shrink-0 bg-black text-white hover:bg-white hover:text-black border border-black px-6 py-3.5 rounded-none font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group self-start md:self-center"
          >
            Create New Goal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Metrics Row: Stark white, rounded-none, border border-black cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white p-6 rounded-none border border-black flex items-center gap-4 transition-colors hover:bg-neutral-50">
          <div className="w-10 h-10 bg-neutral-100 border border-black rounded-none flex items-center justify-center text-black shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Streak</p>
            <p className="text-xl font-black text-black mt-0.5 leading-none">{streak} Days</p>
          </div>
        </div>

        {/* Best Streak */}
        <div className="bg-white p-6 rounded-none border border-black flex items-center gap-4 transition-colors hover:bg-neutral-50">
          <div className="w-10 h-10 bg-neutral-100 border border-black rounded-none flex items-center justify-center text-black shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Best Streak</p>
            <p className="text-xl font-black text-black mt-0.5 leading-none">{bestStreak} Days</p>
          </div>
        </div>

        {/* Study Hours */}
        <div className="bg-white p-6 rounded-none border border-black flex items-center gap-4 transition-colors hover:bg-neutral-50">
          <div className="w-10 h-10 bg-neutral-100 border border-black rounded-none flex items-center justify-center text-black shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Hours Studied</p>
            <p className="text-xl font-black text-black mt-0.5 leading-none">{studyHours.toFixed(1)} hrs</p>
          </div>
        </div>

        {/* XP / Badges */}
        <div className="bg-white p-6 rounded-none border border-black flex items-center gap-4 transition-colors hover:bg-neutral-50">
          <div className="w-10 h-10 bg-neutral-100 border border-black rounded-none flex items-center justify-center text-black shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Badges / XP</p>
            <p className="text-xl font-black text-black mt-0.5 leading-none">{badges} ({xp} XP)</p>
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Current Roadmap & Enrolled Courses */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Current Course / Roadmap focus */}
          <div className="bg-white rounded-none border border-black p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-black pb-4">
              <h2 className="text-lg font-black flex items-center gap-2 text-black uppercase tracking-wider leading-none">
                <BookOpen className="w-5 h-5 text-neutral-700" /> Active Learning Track
              </h2>
              {currentCourse && (
                <span className="text-[10px] font-black text-white bg-black px-2.5 py-1 rounded-none uppercase tracking-wider">
                  Goal In Progress
                </span>
              )}
            </div>

            {currentCourse ? (
              <div className="grid md:grid-cols-12 gap-6 items-center">
                {/* Thumbnail */}
                <div className="md:col-span-4 relative rounded-none overflow-hidden border border-black aspect-video md:aspect-auto md:h-32 bg-neutral-50 flex items-center justify-center group">
                  <img
                    src={currentCourse.thumbnail || "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"}
                    alt={currentCourse.title}
                    className="w-full h-full object-cover transition-all"
                  />
                  <div className="absolute inset-0 bg-white/80 border-t border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-black fill-current" />
                  </div>
                </div>

                {/* Info & Progress */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <h3 className="font-black text-base text-black leading-tight hover:underline">
                      {currentCourse.title}
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase tracking-wide">Course Code: ROADMAP-{currentCourse.course_id}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="uppercase text-[10px] text-neutral-600 tracking-wider">Syllabus Completion</span>
                      <span className="text-black font-black">{currentCourse.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-3 border border-black rounded-none overflow-hidden">
                      <div
                        className="bg-black h-full transition-all duration-500"
                        style={{ width: `${currentCourse.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/learning/${currentCourse.id}`}
                    className="inline-flex bg-black text-white hover:bg-neutral-800 px-5 py-2.5 border border-black rounded-none font-black text-xs uppercase tracking-widest transition-colors items-center gap-2 group"
                  >
                    Resume Lesson Player <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 border border-dashed border-neutral-300 rounded-none space-y-4 bg-neutral-50">
                <div className="w-12 h-12 bg-white border border-black rounded-none flex items-center justify-center mx-auto text-black">
                  <Target className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-sm uppercase tracking-wider text-black">No active learning roadmaps</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Define your skill goal (e.g. Next.js, Django REST, Data Structures) to let Gemini search the web and plan a day-by-day learning schedule.
                  </p>
                </div>
                <Link
                  href="/roadmap"
                  className="inline-flex bg-black text-white hover:bg-neutral-800 border border-black px-6 py-2.5 rounded-none font-black text-xs uppercase tracking-widest transition-colors"
                >
                  Onboard Your First Goal
                </Link>
              </div>
            )}
          </div>

          {/* Enrolled Courses Grid */}
          <div className="space-y-4">
            <h2 className="text-base font-black text-black flex items-center gap-2 uppercase tracking-wider leading-none">
              <Calendar className="w-5 h-5 text-neutral-700" /> My Enrolled Roadmaps
            </h2>
            
            {enrolledCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {enrolledCourses.map((course: any) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-none border border-black p-4 hover:bg-neutral-50 transition-colors flex gap-4"
                  >
                    <div className="w-20 h-16 rounded-none overflow-hidden bg-neutral-100 border border-black shrink-0">
                      <img
                        src={course.thumbnail || "https://img.youtube.com/vi/3JZ_D3KmVjk/hqdefault.jpg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <h4 className="font-black text-xs text-black truncate hover:underline">
                        <Link href={`/learning/${course.id}`}>{course.title}</Link>
                      </h4>
                      <div className="space-y-1">
                        <div className="w-full bg-neutral-100 h-2 border border-black rounded-none overflow-hidden">
                          <div
                            className="bg-black h-full"
                            style={{ width: `${course.progress_percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                          <span>{course.progress_percent}% Complete</span>
                          <Link href={`/learning/${course.id}`} className="text-black font-black hover:underline flex items-center gap-0.5">
                            Open <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic">No archived enrollments. Start a track above!</p>
            )}
          </div>

        </div>

        {/* Right Side: Tasks Checklist & Activity Feed */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Today's Tasks */}
          <div className="bg-white rounded-none border border-black p-6 space-y-4">
            <h3 className="font-black text-sm text-black border-b border-black pb-3 flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-neutral-700" /> Today's Action Checklist
            </h3>

            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-3 p-2.5 border border-black hover:bg-neutral-50 cursor-pointer transition-all"
                  >
                    <button className="shrink-0 mt-0.5 text-black">
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-black fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <span className={`text-xs font-bold block leading-tight ${task.completed ? "line-through text-neutral-400" : "text-black"}`}>
                        {task.title}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-black uppercase tracking-wider block mt-1">
                        Est. {task.estimated_minutes || 120} mins
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-neutral-500 italic">
                All caught up! Build a roadmap or resume your track.
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-none border border-black p-6 space-y-4">
            <h3 className="font-black text-sm text-black border-b border-black pb-3 uppercase tracking-wider">
              Activity Feed
            </h3>

            <div className="space-y-4">
              {recentActivities.map((act: any) => (
                <div key={act.id} className="flex gap-3 items-start text-xs border-b border-neutral-100 pb-2 last:border-0 last:pb-0">
                  <div className="w-2 h-2 bg-black mt-1.5 shrink-0" />
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-black leading-normal">{act.text}</p>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
