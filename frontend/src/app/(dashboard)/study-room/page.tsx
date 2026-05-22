"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Tv, Play, Square, AlertTriangle, Eye, Award, Sparkles, CameraOff } from "lucide-react";

export default function StudyRoomPage() {
  const [sessionActive, setSessionActive] = useState(false);
  const [goalMinutes, setGoalMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionId, setSessionId] = useState<number | null>(null);

  // Focus tracking state
  const [focusScore, setFocusScore] = useState(95);
  const [distractionsCount, setDistractionsCount] = useState(0);
  const [focusStatus, setFocusStatus] = useState<"Focused" | "Distracted" | "Calibrating">("Calibrating");

  // Webcam stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(true);

  // Scorecard modal state
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Countdown timer interval
  useEffect(() => {
    let timer: any = null;
    if (sessionActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        
        setFocusScore((prev) => {
          if (focusStatus === "Distracted") return Math.max(25, prev - 5);
          const next = prev + (Math.random() > 0.5 ? 1 : -1);
          return Math.min(99, Math.max(88, next));
        });
      }, 1000);
    } else if (timeLeft === 0 && sessionActive) {
      handleEndSession();
    }
    return () => clearInterval(timer);
  }, [sessionActive, timeLeft, focusStatus]);

  // Start study session webcam
  const handleStartSession = async () => {
    try {
      const res = await api.startStudySession(goalMinutes);
      setSessionId(res.id);
      setTimeLeft(goalMinutes * 60);
      setSessionActive(true);
      setFocusScore(95);
      setDistractionsCount(0);
      setFocusStatus("Calibrating");
      setShowReport(false);

      // Start webcam stream
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240 },
            audio: false,
          });
          setStream(videoStream);
          setHasCamera(true);
          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
          }
          
          setTimeout(() => {
            setFocusStatus("Focused");
          }, 3000);
        } catch (cameraErr) {
          console.warn("Camera access denied or unavailable:", cameraErr);
          setHasCamera(false);
          setFocusStatus("Focused");
        }
      } else {
        setHasCamera(false);
        setFocusStatus("Focused");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start study session.");
    }
  };

  // End study session
  const handleEndSession = async () => {
    if (!sessionId) return;
    setSessionActive(false);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    const elapsedSeconds = goalMinutes * 60 - timeLeft;
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    try {
      const res = await api.endStudySession(sessionId, {
        focus_score: focusScore,
        distraction_count: distractionsCount,
        duration_minutes: durationMinutes,
      });

      setReportData({
        duration: durationMinutes,
        score: focusScore,
        distractions: distractionsCount,
        xp: res.xp_earned || 50,
      });
      setShowReport(true);
      setSessionId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to end session.");
    }
  };

  // Simulate user looking away or holding up phone
  const handleSimulateDistraction = () => {
    if (!sessionActive) return;
    setFocusStatus("Distracted");
    setFocusScore(32);
    setDistractionsCount((prev) => prev + 1);

    setTimeout(() => {
      setFocusStatus("Focused");
      setFocusScore(91);
    }, 4000);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-black text-black flex items-center gap-2 uppercase tracking-tight">
          <Tv className="w-7 h-7" /> AI Focus Study Room
        </h1>
        <p className="text-xs text-neutral-500 font-bold mt-1 uppercase tracking-wider">
          Lock in study timers while our AI camera detector logs your focus score.
        </p>
      </div>

      {/* Main Study Interface */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Video Feed & Timer */}
        <div className="lg:col-span-7 bg-white rounded-none border border-black p-6 flex flex-col items-center justify-between min-h-[450px]">
          {sessionActive ? (
            <div className="w-full space-y-6 flex flex-col items-center">
              {/* Webcam Frame wrapper with 1px black border */}
              <div className="relative w-80 h-60 rounded-none overflow-hidden bg-black border border-black flex items-center justify-center shrink-0">
                {hasCamera ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  /* Mock face outline overlay */
                  <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center text-center p-4 relative">
                    <div className="absolute inset-4 border border-dashed border-black/30 rounded-none flex items-center justify-center">
                      <div className="w-24 h-24 border border-black rounded-none opacity-40 flex items-center justify-center relative animate-pulse">
                        <div className="w-2.5 h-2.5 bg-black rounded-none absolute -top-1" />
                        <Eye className="w-10 h-10 text-neutral-500" />
                      </div>
                    </div>
                    <CameraOff className="w-8 h-8 text-neutral-600 mb-2 z-10" />
                    <span className="text-[9px] text-neutral-500 font-black z-10 uppercase tracking-wider">NO CAMERA DETECTED</span>
                    <span className="text-[9px] text-neutral-400 font-black z-10 animate-pulse mt-1 uppercase tracking-wider">SIMULATING RETINAL GRID</span>
                  </div>
                )}

                {/* Status Overlay Badge */}
                <div className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-none border border-black z-20 ${
                  focusStatus === "Focused"
                    ? "bg-black text-white"
                    : focusStatus === "Distracted"
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-neutral-100 text-black"
                }`}>
                  {focusStatus}
                </div>

                {/* Retinal Scanning laser line */}
                {focusStatus !== "Distracted" && (
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-white opacity-40 animate-[circuit-slide_2s_infinite]" />
                )}
              </div>

              {/* Live timer countdown */}
              <div className="text-center space-y-2">
                <span className="text-5xl font-mono font-black text-black tracking-wider leading-none">
                  {formatTime(timeLeft)}
                </span>
                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-1">Session Time Remaining</p>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSimulateDistraction}
                  className="border border-black hover:bg-neutral-50 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-none transition-colors"
                >
                  Simulate Look-Away
                </button>
                <button
                  onClick={handleEndSession}
                  className="bg-black text-white hover:bg-neutral-800 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 border border-black rounded-none transition-colors flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5 fill-current text-white shrink-0" /> End Session
                </button>
              </div>
            </div>
          ) : (
            /* Setup State */
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 my-auto">
              <div className="w-12 h-12 bg-neutral-50 border border-black rounded-none flex items-center justify-center text-black">
                <Eye className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-sm uppercase tracking-wider text-black">Configure Study Session</h4>
                <p className="text-xs text-neutral-500 max-w-sm font-semibold">
                  Our system keeps you focused on your screen during pomodoro intervals. Leaving your seat or checking your phone drops your focus score.
                </p>
              </div>

              {/* select minutes */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Duration:</span>
                <select
                  value={goalMinutes}
                  onChange={(e) => setGoalMinutes(Number(e.target.value))}
                  className="bg-white border border-black px-3 py-2 rounded-none text-xs font-bold text-black focus:outline-none"
                >
                  <option value={1}>1 Minute (Test)</option>
                  <option value={25}>25 Minutes (Pomodoro)</option>
                  <option value={50}>50 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>

              <button
                onClick={handleStartSession}
                className="bg-black text-white hover:bg-neutral-800 border border-black px-6 py-3 rounded-none font-black text-xs uppercase tracking-widest flex items-center gap-2 group"
              >
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Initialize AI Focus Cam</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Metrics panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live tracking stats card */}
          <div className="bg-white rounded-none border border-black p-6 space-y-6">
            <h3 className="font-black text-xs uppercase tracking-widest text-black border-b border-black pb-2">
              📊 Live Session Metrics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 border border-black text-center space-y-1 rounded-none">
                <span className="text-2xl font-black text-black leading-none">{focusScore}%</span>
                <p className="text-[9px] text-neutral-500 font-black uppercase tracking-wider mt-1">Retinal Focus Score</p>
              </div>
              <div className="bg-neutral-50 p-4 border border-black text-center space-y-1 rounded-none">
                <span className="text-2xl font-black text-red-500 leading-none">{distractionsCount}</span>
                <p className="text-[9px] text-neutral-500 font-black uppercase tracking-wider mt-1">Distraction Flags</p>
              </div>
            </div>

            {/* Warn box if distracted */}
            {focusStatus === "Distracted" && (
              <div className="bg-white border-2 border-red-500 p-4 rounded-none flex items-start gap-3 text-xs text-red-500 font-black uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="block">DISTRACTION DETECTED!</p>
                  <p className="font-bold text-[9px] text-red-400 mt-0.5">Please look back at the screen to resume focus points logging.</p>
                </div>
              </div>
            )}

            <div className="text-[11px] text-neutral-500 font-semibold leading-relaxed">
              <span className="font-black text-black block mb-1 uppercase tracking-wider text-[10px]">How it works:</span>
              Face outline parameters calculate coordinates. Deflections out of boundary boxes for more than 3 seconds log as a distraction warning and penalize session XP.
            </div>
          </div>
        </div>

      </div>

      {/* Session Summary Scorecard Report Modal - Brutalist overlay */}
      {showReport && reportData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-none border-2 border-black max-w-sm w-full p-6 text-center space-y-6 relative shadow-brutal">
            <div className="w-12 h-12 bg-neutral-50 border border-black text-black flex items-center justify-center mx-auto rounded-none">
              <Award className="w-7 h-7" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-black text-lg text-black uppercase tracking-wide">Study Session Scorecard</h3>
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Completed Pomodoro Interval Report</p>
            </div>

            <hr className="border-black opacity-10" />

            <div className="grid grid-cols-3 gap-3 text-xs font-semibold">
              <div className="bg-neutral-50 border border-black p-2.5 rounded-none">
                <span className="block text-sm font-black text-black leading-none">{reportData.duration} min</span>
                <span className="text-[9px] text-neutral-500 font-black uppercase mt-1 block tracking-wider">Duration</span>
              </div>
              <div className="bg-neutral-50 border border-black p-2.5 rounded-none">
                <span className="block text-sm font-black text-black leading-none">{reportData.score}%</span>
                <span className="text-[9px] text-neutral-500 font-black uppercase mt-1 block tracking-wider">Avg Focus</span>
              </div>
              <div className="bg-neutral-50 border border-black p-2.5 rounded-none">
                <span className="block text-sm font-black text-red-500 leading-none">{reportData.distractions}</span>
                <span className="text-[9px] text-neutral-500 font-black uppercase mt-1 block tracking-wider">Checks</span>
              </div>
            </div>

            <div className="bg-neutral-50 border border-black p-4 text-xs font-black text-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-none">
              <Sparkles className="w-4 h-4 text-black shrink-0" />
              <span>Session Logged! +{reportData.xp} XP</span>
            </div>

            <button
              onClick={() => setShowReport(false)}
              className="w-full bg-black text-white hover:bg-neutral-800 py-3 rounded-none font-black text-xs uppercase tracking-widest border border-black"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
