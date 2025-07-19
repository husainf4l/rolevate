"use client";

import "@livekit/components-styles";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Room, Track } from "livekit-client";
import {
  RoomContext,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  useLocalParticipant,
  VideoTrack,
} from "@livekit/components-react";
import {
  CpuChipIcon,
  PhoneXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import ParticleBackground from "@/components/interview/ParticleBackground";

// Enhanced Rolevate animations with professional effects
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(19, 234, 217, 0.3); }
    50% { box-shadow: 0 0 40px rgba(19, 234, 217, 0.6), 0 0 60px rgba(8, 145, 178, 0.3); }
  }
  
  @keyframes ripple {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes slide-down {
    0% { 
      transform: translateY(-100%); 
      opacity: 0; 
    }
    10% { 
      opacity: 1; 
    }
    90% { 
      opacity: 1; 
    }
    100% { 
      transform: translateY(100vh); 
      opacity: 0; 
    }
  }

  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes fadeInUp {
    0% { 
      opacity: 0; 
      transform: translateY(30px); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  @keyframes scaleIn {
    0% { 
      opacity: 0; 
      transform: scale(0.9); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1); 
    }
  }

  @keyframes orbit {
    0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
  }
  
  .interview-float { animation: float 4s ease-in-out infinite; }
  .interview-glow { animation: glow 2.5s ease-in-out infinite; }
  .interview-ripple { animation: ripple 1.5s ease-out infinite; }
  .animate-spin-slow { animation: spin-slow 8s linear infinite; }
  .interview-breathe { animation: breathe 3s ease-in-out infinite; }
  .interview-shimmer { 
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  .interview-fadeInUp { animation: fadeInUp 0.6s ease-out; }
  .interview-scaleIn { animation: scaleIn 0.4s ease-out; }
  .interview-orbit { animation: orbit 15s linear infinite; }
`;

if (typeof document !== "undefined") {
  if (!document.head.querySelector("[data-room2-styles]")) {
    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-room2-styles", "true");
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
  }
}

// Enhanced Interview UI - Professional Design
function EnhancedInterviewUI() {
  const { state, audioTrack } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [sessionDuration, setSessionDuration] = useState(0);

  // Session timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const localVideoTrack = localParticipant.getTrackPublication(
    Track.Source.Camera
  )?.track;

  const statusInfo = {
    idle: {
      text: "Ready",
      color: "blue-500",
      bgColor: "bg-blue-500",
      message: "The session is ready to begin.",
    },
    listening: {
      text: "Listening",
      color: "green-500",
      bgColor: "bg-green-500",
      message: "Please state your answer clearly.",
    },
    thinking: {
      text: "Analyzing",
      color: "amber-500",
      bgColor: "bg-amber-500",
      message: "Processing your response...",
    },
    speaking: {
      text: "Speaking",
      color: "purple-500",
      bgColor: "bg-purple-500",
      message: "The AI is responding.",
    },
    disconnected: {
      text: "Reconnecting",
      color: "gray-500",
      bgColor: "bg-gray-500",
      message: "Attempting to reconnect.",
    },
  } as const;

  const currentStatus =
    statusInfo[state as keyof typeof statusInfo] || statusInfo.idle;

  const tipMessages = {
    initializing: "Initializing the AI session, please wait...",
    idle: "Ready for your first question. Take a deep breath.",
    listening: "Speak naturally. There's no need to rush your answers.",
    thinking: "Excellent point. Let me consider that for a moment.",
    speaking: "Listen carefully to the question before you respond.",
    disconnected: "Hold on, we seem to have a connection issue.",
    connecting: "Establishing a secure connection...",
  };

  return (
    <div className="relative bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/30 overflow-hidden w-full max-w-7xl mx-auto interview-fadeInUp">
      {/* Enhanced Premium Gradient Border Effect */}
      <div className="absolute inset-0 rounded-[2rem] p-[2px]">
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-[#13ead9]/40 via-[#0891b2]/40 to-[#13ead9]/40 interview-shimmer"></div>
        <div className="relative w-full h-full bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-white/20"></div>
      </div>

      {/* Floating Ambient Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#13ead9]/10 to-transparent rounded-full blur-xl interview-float"></div>
        <div
          className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-br from-[#0891b2]/10 to-transparent rounded-full blur-xl interview-float"
          style={{ animationDelay: "2s", animationDuration: "8s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-purple-400/5 to-transparent rounded-full blur-lg interview-breathe"></div>
      </div>

      {/* Premium Executive Header */}
      <div className="relative z-10 px-8 py-7 border-b border-gray-200/30 bg-gradient-to-r from-white/70 to-slate-50/70 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative interview-scaleIn">
              <div className="w-16 h-16 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-3xl flex items-center justify-center shadow-2xl interview-breathe">
                <CpuChipIcon className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white animate-pulse shadow-lg"></div>
              {/* Premium Orbital Ring */}
              <div className="absolute inset-0 interview-orbit">
                <div className="w-2 h-2 bg-[#13ead9] rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 shadow-lg"></div>
              </div>
              <div
                className="absolute inset-0 interview-orbit"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "8s",
                }}
              >
                <div className="w-1.5 h-1.5 bg-[#0891b2] rounded-full absolute bottom-0 right-0 shadow-lg"></div>
              </div>
            </div>
            <div
              className="interview-fadeInUp"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="text-2xl font-bold text-slate-800 font-display tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
                AI Interview Session
              </h2>
              <p className="text-slate-500 text-sm font-text flex items-center gap-3 mt-1">
                <span className="w-2 h-2 bg-[#13ead9] rounded-full animate-pulse shadow-sm"></span>
                <span className="font-medium">
                  Powered by Rolevate AI Intelligence
                </span>
                <div className="h-3 w-px bg-slate-300"></div>
                <span className="text-xs px-2 py-1 bg-slate-100 rounded-full font-semibold text-slate-600">
                  ENTERPRISE
                </span>
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-4 interview-fadeInUp"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Premium Status Indicator */}
            <div className="flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <div
                  className={`w-4 h-4 rounded-full ${currentStatus.bgColor} shadow-lg`}
                ></div>
                <div
                  className={`absolute inset-0 w-4 h-4 rounded-full ${currentStatus.bgColor} animate-ping opacity-75`}
                ></div>
              </div>
              <span className="text-sm font-semibold text-slate-700 font-text">
                {currentStatus.text}
              </span>
            </div>

            {/* Live Recording Indicator */}
            <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-50"></div>
              </div>
              <span className="text-xs font-bold text-red-600 font-text tracking-wider">
                LIVE
              </span>
            </div>

            {/* Session Timer */}
            <div className="hidden md:flex items-center gap-2 px-4 py-3 bg-slate-50/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg">
              <ClockIcon className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-mono text-slate-600 font-semibold">
                {Math.floor(sessionDuration / 60)}:
                {(sessionDuration % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 p-8">
        {/* Premium Candidate Video Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Executive Video Panel */}
          <div className="relative aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 group hover:shadow-3xl transition-all duration-500 interview-scaleIn">
            {/* Premium Border Enhancement */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#13ead9]/20 via-transparent to-[#0891b2]/20 p-[1px]">
              <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl"></div>
            </div>

            {localVideoTrack ? (
              <VideoTrack
                trackRef={{
                  publication: localParticipant.getTrackPublication(
                    Track.Source.Camera
                  )!,
                  source: Track.Source.Camera,
                  participant: localParticipant,
                }}
                className="w-full h-full object-cover relative z-10 rounded-3xl"
              />
            ) : (
              <div className="relative z-10 w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center text-slate-500">
                  <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-xl interview-breathe">
                    <VideoCameraSlashIcon className="w-12 h-12 text-slate-400" />
                  </div>
                  <div className="text-xl font-bold text-slate-600 font-display mb-2">
                    Camera Disabled
                  </div>
                  <div className="text-sm text-slate-500 font-text mb-4">
                    Audio-only interview mode active
                  </div>
                  <div className="px-4 py-2 bg-slate-200/50 rounded-2xl text-xs font-medium text-slate-600">
                    Your voice is being captured clearly
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Video Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-20"></div>

            {/* Premium Candidate Badge */}
            <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-xl text-white px-6 py-3 rounded-2xl text-sm font-semibold shadow-2xl z-30 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-300 rounded-full animate-ping opacity-50"></div>
                </div>
                <span className="font-text">Candidate</span>
              </div>
            </div>

            {/* Floating Quality Indicator */}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 shadow-xl z-30 border border-slate-200/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                  <div className="w-1 h-2 bg-green-400 rounded-full"></div>
                  <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                </div>
                <span>HD</span>
              </div>
            </div>
          </div>

          {/* Premium Audio Analysis Panel */}
          <div
            className="bg-gradient-to-br from-white via-slate-50/50 to-white backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-2xl interview-fadeInUp"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-700 font-display bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text">
                Real-time Audio Intelligence
              </h3>
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border border-green-200/50 shadow-lg">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-50"></div>
                </div>
                <span className="text-xs font-bold text-green-700 font-text tracking-wider">
                  ANALYZING
                </span>
              </div>
            </div>

            {/* Enhanced Audio Visualization */}
            <div className="relative h-28 w-full flex items-center justify-center mb-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/50 shadow-inner overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 left-4 w-1 h-1 bg-[#13ead9] rounded-full animate-pulse"></div>
                <div
                  className="absolute top-6 right-8 w-1 h-1 bg-[#0891b2] rounded-full animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                ></div>
                <div
                  className="absolute bottom-4 left-12 w-1 h-1 bg-[#13ead9] rounded-full animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                ></div>
              </div>

              {audioTrack ? (
                <div className="w-full h-full relative p-4">
                  <BarVisualizer
                    state={state}
                    barCount={60}
                    trackRef={audioTrack}
                    className="w-full h-full"
                    options={{
                      minHeight: 4,
                      maxHeight: 90,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#13ead9]/20 via-[#0891b2]/20 to-[#13ead9]/20 rounded-2xl pointer-events-none interview-shimmer"></div>
                </div>
              ) : (
                <div className="flex gap-1.5 items-end h-full w-full justify-center p-6">
                  {Array.from({ length: 45 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-[#13ead9] via-[#0891b2] to-[#13ead9] rounded-full shadow-lg"
                      style={{
                        height: `${20 + Math.random() * 60}%`,
                        animation: `pulse 2s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                        opacity: 0.7 + Math.random() * 0.3,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600 font-text">
                {tipMessages[state as keyof typeof tipMessages] ??
                  tipMessages.idle}
              </p>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel - Enhanced */}
        <div className="lg:col-span-2 space-y-6">
          {/* Premium AI Avatar Section */}
          <div className="relative bg-gradient-to-br from-white via-slate-50/50 to-white backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-2xl text-center interview-scaleIn group hover:shadow-3xl transition-all duration-500">
            {/* Premium Background Pattern */}
            <div className="absolute inset-0 rounded-3xl opacity-30">
              <div className="absolute top-4 left-4 w-2 h-2 bg-[#13ead9] rounded-full animate-pulse"></div>
              <div
                className="absolute top-8 right-6 w-1.5 h-1.5 bg-[#0891b2] rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute bottom-6 left-8 w-1 h-1 bg-[#13ead9] rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            <div className="relative w-36 h-36 mx-auto mb-8 interview-float">
              {/* Enhanced orbital rings */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-full animate-pulse shadow-2xl"></div>
              <div className="absolute inset-3 bg-gradient-to-br from-[#13ead9]/30 to-[#0891b2]/30 rounded-full interview-shimmer"></div>

              {/* Executive AI Avatar */}
              <div className="absolute inset-6 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center shadow-2xl interview-glow group-hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-bold text-white font-display tracking-wider">
                  AI
                </span>
              </div>

              {/* Premium State Indicators */}
              {state === "speaking" && (
                <div className="absolute -bottom-3 -right-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute inset-0 w-12 h-12 bg-purple-400 rounded-full interview-ripple opacity-60"></div>
                </div>
              )}

              {state === "listening" && (
                <div className="absolute -top-3 -right-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              )}

              {state === "thinking" && (
                <div className="absolute -top-2 -left-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg interview-spin-slow">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-3 font-display bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
              AI Executive Interviewer
            </h3>
            <p className="text-slate-600 mb-6 font-text text-lg leading-relaxed">
              {currentStatus.message}
            </p>

            {/* Premium Status Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-100 to-white rounded-2xl border border-slate-200/50 shadow-lg">
              <div className="relative">
                <div
                  className={`w-3 h-3 rounded-full ${currentStatus.bgColor} shadow-lg`}
                ></div>
                <div
                  className={`absolute inset-0 w-3 h-3 rounded-full ${currentStatus.bgColor} animate-ping opacity-50`}
                ></div>
              </div>
              <span className="text-sm font-semibold text-slate-700 font-text">
                {currentStatus.text}
              </span>
            </div>
          </div>

          {/* Executive Interview Analytics */}
          <div
            className="relative bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-xl rounded-3xl p-8 border border-blue-200/50 shadow-2xl interview-fadeInUp"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Premium Header */}
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-slate-800 font-display bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text">
                Performance Analytics
              </h4>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>

            <div className="space-y-6">
              {/* Enhanced Metrics */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 font-text">
                    Voice Clarity & Articulation
                  </span>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    EXCELLENT
                  </span>
                </div>
                <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-lg interview-shimmer"
                    style={{ width: "85%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-text">
                  <span>Below Average</span>
                  <span>Exceptional</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 font-text">
                    Response Timing
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    OPTIMAL
                  </span>
                </div>
                <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-lg interview-shimmer"
                    style={{ width: "78%", animationDelay: "0.5s" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-text">
                  <span>Too Fast</span>
                  <span>Perfect Pace</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700 font-text">
                    Engagement Level
                  </span>
                  <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    OUTSTANDING
                  </span>
                </div>
                <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full shadow-lg interview-shimmer"
                    style={{ width: "92%", animationDelay: "1s" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-text">
                  <span>Passive</span>
                  <span>Highly Engaged</span>
                </div>
              </div>

              {/* Live Feedback Summary */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-slate-700 font-text">
                    Live Assessment
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-text">
                  Demonstrating strong communication skills with clear
                  articulation and thoughtful responses. Maintaining excellent
                  professional presence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Executive Control Panel */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div
          className="flex items-center gap-4 px-8 py-4 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl interview-fadeInUp"
          style={{ animationDelay: "0.8s" }}
        >
          {/* Session Info */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200/50">
            <ClockIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-mono text-slate-600 font-semibold">
              {Math.floor(sessionDuration / 60)}:
              {(sessionDuration % 60).toString().padStart(2, "0")}
            </span>
            <div className="h-4 w-px bg-slate-300"></div>
            <span className="text-xs text-slate-500 font-text">Duration</span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-3 px-4 py-2 bg-green-50 rounded-2xl border border-green-200/50">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-50"></div>
            </div>
            <span className="text-sm font-semibold text-green-700 font-text">
              Secure Connection
            </span>
          </div>

          {/* Quality Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-200/50">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              <div className="w-1 h-3 bg-blue-400 rounded-full"></div>
              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
              <div className="w-1 h-2 bg-blue-300 rounded-full"></div>
            </div>
            <span className="text-sm font-semibold text-blue-700 font-text">
              Excellent Quality
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Room2Page() {
  const searchParams = useSearchParams();
  const [room] = useState(() => new Room());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const directToken = searchParams.get("token");
  const directRoomName = searchParams.get("roomName");
  const directServerUrl = searchParams.get("serverUrl");
  const phone = searchParams.get("phone");
  const jobId = searchParams.get("jobId");
  const backendRoomName = searchParams.get("roomName");

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isConnected) return;
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isConnected]);

  const handleStartInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setNeedsPermission(false);
      console.log("🎤📹 Microphone and camera permissions granted");
    } catch (err) {
      console.error("❌ Microphone/camera permission denied:", err);
      setError(
        "Microphone and camera permissions are required for the voice interview."
      );
    }
  };

  useEffect(() => {
    if (needsPermission) return;

    const connectToRoom = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        let token = directToken;
        let roomName = directRoomName;
        let serverUrl =
          directServerUrl || "wss://rolvate2-ckmk80qb.livekit.cloud";

        if (!token && phone && jobId && backendRoomName) {
          console.log("🔌 Creating and joining new room via backend...");
          const createResponse = await fetch(
            "http://localhost:4005/api/room/create-new-room",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jobId, phone, roomName: backendRoomName }),
            }
          );

          if (!createResponse.ok)
            throw new Error(
              `Failed to create room: ${await createResponse.text()}`
            );

          const createData = await createResponse.json();
          console.log("✅ Room created successfully:", createData);
          token = createData.token;
          roomName = createData.newRoom?.name || createData.roomName;
          serverUrl = createData.liveKitUrl;
        }

        if (!token || !roomName)
          throw new Error("Missing token or roomName parameters");

        console.log("🚀 Connecting to LiveKit room:", { roomName, serverUrl });
        room.removeAllListeners();
        room.on("connected", () => {
          setIsConnected(true);
          setIsConnecting(false);
          console.log("✅ Connected");
        });
        room.on("disconnected", (reason) => {
          setIsConnected(false);
          setIsConnecting(false);
          console.log("❌ Disconnected:", reason);
        });
        room.on("reconnecting", () => {
          setIsConnecting(true);
          console.log("🔄 Reconnecting...");
        });
        room.on("reconnected", () => {
          setIsConnected(true);
          setIsConnecting(false);
          console.log("✅ Reconnected");
        });

        await room.connect(serverUrl, token, {
          autoSubscribe: true,
          rtcConfig: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          },
        });

        await room.localParticipant.setMicrophoneEnabled(true);
        await room.localParticipant.setCameraEnabled(true);
        console.log("🎤📹 Mic/Cam enabled");
      } catch (err: any) {
        console.error("💥 Connection failed:", err);
        setError(err.message || "Failed to connect to room");
        setIsConnecting(false);
      }
    };

    connectToRoom();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return "Are you sure you want to leave? This will end the interview.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    needsPermission,
    directToken,
    directRoomName,
    directServerUrl,
    phone,
    jobId,
    backendRoomName,
  ]);

  const handleDisconnect = () => {
    if (room.state === "connected") room.disconnect();
  };

  const PageWrapper = ({
    children,
    title,
    description,
  }: {
    children: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/30 p-12">
          {children}
          <h2 className="text-2xl font-bold text-gray-900 mb-3 font-display tracking-tight">
            {title}
          </h2>
          <p className="text-gray-600 mb-8 font-text leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  const PrimaryButton = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] hover:from-[#0891b2] hover:to-[#13ead9] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
    >
      {children}
    </button>
  );

  if (needsPermission) {
    return (
      <PageWrapper
        title="Voice Interview Setup"
        description="We need access to your microphone and camera to conduct the voice interview with our AI assistant."
      >
        <div className="relative w-20 h-20 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg interview-glow">
          <VideoCameraIcon className="w-10 h-10 text-white" />
          <div className="absolute inset-0 rounded-2xl border-2 border-[#13ead9]/50 animate-ping"></div>
        </div>
        <PrimaryButton onClick={handleStartInterview}>
          Start Interview
        </PrimaryButton>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title="Connection Error"
        description={error || "An unknown error occurred."}
      >
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-50/80 rounded-xl text-left">
          <p className="font-medium mb-2">
            This page requires specific URL parameters to function correctly.
            Please ensure you have the correct link.
          </p>
        </div>
        <PrimaryButton onClick={() => window.location.reload()}>
          Try Again
        </PrimaryButton>
      </PageWrapper>
    );
  }

  if (isConnecting) {
    return (
      <PageWrapper
        title="Creating New Room..."
        description="Setting up your secure interview session. This won't take long."
      >
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-[#13ead9] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-[#0891b2]/30 border-b-transparent rounded-full animate-spin delay-150 mx-auto"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] z-[1]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-full blur-3xl animate-pulse z-[2]"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-[#13ead9]/10 rounded-full blur-2xl animate-pulse delay-1000 z-[2]"></div>
        <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200/50 shadow-sm sticky top-0 z-20">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-xl flex items-center justify-center shadow-lg">
                    <VideoCameraIcon className="w-6 h-6 text-white" />
                  </div>
                  {isConnected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 font-display tracking-tight">
                    AI Interview Room
                  </h1>
                  <p className="text-sm text-slate-500 font-text">
                    Rolevate AI Platform
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/50 shadow-sm">
                  <div className="relative">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {isConnected && (
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium font-text ${
                      isConnected ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                {isConnected && (
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-white rounded-full border border-gray-200/50 shadow-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-800 font-mono tracking-wider">
                      {formatDuration(callDuration)}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleDisconnect}
                  className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-red-200 transform hover:scale-105"
                  title="Leave interview"
                >
                  <PhoneXMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <ParticleBackground />
          <div className="w-full max-w-7xl relative z-10">
            {isConnected ? (
              <EnhancedInterviewUI />
            ) : (
              <PageWrapper
                title="Waiting for Connection"
                description="The interview will begin once you are connected to the room."
              >
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <VideoCameraSlashIcon className="w-10 h-10 text-slate-500" />
                </div>
              </PageWrapper>
            )}
          </div>
        </main>

        <div
          id="audio-container"
          className="fixed top-0 left-0 w-0 h-0 overflow-visible"
        >
          <RoomAudioRenderer volume={1.0} muted={false} />
        </div>
      </div>
    </RoomContext.Provider>
  );
}
