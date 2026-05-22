"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Activity,
  Award,
  BookOpen,
  TrendingUp,
  Clock,
  ChevronUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [conceptsProgress, setConceptsProgress] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      try {
        setLoading(true);
        const [wData, cData, lData, tData] = await Promise.all([
          api.getWeeklyProgress(),
          api.getConceptsProgress(),
          api.getLeaderboard(),
          api.getTrendingTopics(),
        ]);
        setWeeklyProgress(wData);
        setConceptsProgress(cData);
        setLeaderboard(lData);
        setTrends(tData);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load progress analytics.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-black border-t-transparent animate-spin rounded-none" />
        <p className="mt-4 font-bold text-xs text-black tracking-wider uppercase">Calculating Concepts Velocity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-black text-black flex items-center gap-2 uppercase tracking-tight">
          <Activity className="w-7 h-7" /> Progress & Analytics
        </h1>
        <p className="text-xs text-neutral-500 font-bold mt-1 uppercase tracking-wider">
          Review your concept velocity, study duration reports, and global rank.
        </p>
      </div>

      {/* Charts section */}
      {mounted && (
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Weekly Hours */}
          <div className="bg-white rounded-none border border-black p-6 space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-black flex items-center gap-2">
              <Clock className="w-4 h-4" /> Weekly Study Minutes
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="0" stroke="#000000" strokeWidth={0.5} opacity={0.1} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#000000", fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#000000", fontWeight: "bold" }} label={{ value: 'minutes', angle: -90, position: 'insideLeft', style: { fontSize: 8, fill: '#000000', fontWeight: 'black', textTransform: 'uppercase' } }} />
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #000000", borderRadius: 0, color: "#000000", fontSize: 10, fontWeight: "bold" }} />
                  <Bar dataKey="minutes" fill="#000000" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Cumulative Concepts Velocity */}
          <div className="bg-white rounded-none border border-black p-6 space-y-4">
            <h3 className="font-black text-xs uppercase tracking-widest text-black flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Concepts Mastered Velocity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conceptsProgress}>
                  <CartesianGrid strokeDasharray="0" stroke="#000000" strokeWidth={0.5} opacity={0.1} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#000000", fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#000000", fontWeight: "bold" }} />
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #000000", borderRadius: 0, color: "#000000", fontSize: 10, fontWeight: "bold" }} />
                  <Line type="monotone" dataKey="velocity" stroke="#000000" strokeWidth={2} dot={{ r: 4, fill: "#000000", stroke: "#000000", strokeWidth: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Leaderboard and trends split panel */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Leaderboard */}
        <div className="lg:col-span-8 bg-white rounded-none border border-black p-6 space-y-6">
          <h3 className="font-black text-xs uppercase tracking-widest text-black border-b border-black pb-3 flex items-center gap-2">
            <Award className="w-5 h-5" /> Global Leaderboard
          </h3>

          <div className="space-y-2">
            {leaderboard.map((user) => {
              let rankStyle = "bg-neutral-100 text-neutral-600 border border-neutral-300";
              if (user.rank === 1) rankStyle = "bg-black text-white border border-black font-black";
              if (user.rank === 2) rankStyle = "bg-neutral-200 text-black border border-black font-black";
              if (user.rank === 3) rankStyle = "bg-neutral-100 text-black border border-black font-black";

              return (
                <div
                  key={user.rank}
                  className={`flex items-center justify-between p-3.5 border transition-all rounded-none ${
                    user.is_current_user
                      ? "border-2 border-black bg-neutral-50 font-black"
                      : "border-black bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-6 h-6 rounded-none flex items-center justify-center text-[10px] ${rankStyle}`}>
                      {user.rank}
                    </span>
                    <div className="w-8 h-8 rounded-none overflow-hidden bg-neutral-100 border border-black shrink-0">
                      <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-black uppercase tracking-wide">
                        {user.username} {user.is_current_user && " (You)"}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-black">{user.xp} XP</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trends */}
        <div className="lg:col-span-4 bg-white rounded-none border border-black p-6 space-y-4">
          <h3 className="font-black text-xs uppercase tracking-widest text-black border-b border-black pb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Trending Topics
          </h3>

          <div className="space-y-4">
            {trends.map((trend, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                <div className="space-y-0.5">
                  <h5 className="font-black text-xs text-black hover:underline uppercase tracking-wide">
                    {trend.topic}
                  </h5>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                    {trend.learners} studying
                  </span>
                </div>
                <div className="flex gap-1 items-center font-black text-black bg-neutral-100 border border-black px-2 py-0.5 rounded-none text-[9px] uppercase tracking-wider">
                  <ChevronUp className="w-3.5 h-3.5" /> High
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
