import React from "react";
import { useVoiceAssistant } from "@livekit/components-react";
import { useAudioVisualization } from "../hooks/useAudioVisualization";

interface AudioVisualizationProps {
  isMicEnabled: boolean;
  sessionDuration: number;
}

export function AudioVisualization({ isMicEnabled, sessionDuration }: AudioVisualizationProps) {
  const { state } = useVoiceAssistant();
  const { audioLevels, hasAudioActivity } = useAudioVisualization(isMicEnabled);

  const statusInfo = {
    idle: { message: "Interview session is ready" },
    listening: { message: "Actively listening to your response" },
    thinking: { message: "Analyzing your response" },
    speaking: { message: "AI interviewer is responding" },
    disconnected: { message: "Attempting to reconnect" },
  } as const;

  const currentStatus = statusInfo[state as keyof typeof statusInfo] || statusInfo.idle;

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-sm p-6 border border-slate-200/50 shadow-lg">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-700">Real-time Audio Analysis</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
          isMicEnabled ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isMicEnabled ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-xs font-medium ${
            isMicEnabled ? 'text-green-700' : 'text-red-700'
          }`}>
            {isMicEnabled ? 'ACTIVE' : 'MUTED'}
          </span>
        </div>
      </div>

      {/* Audio Visualization */}
      <div className="relative h-20 w-full bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/50 shadow-inner overflow-hidden">
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-4 w-1 h-1 bg-[#13ead9] rounded-full animate-pulse"></div>
          <div className="absolute top-6 right-8 w-1 h-1 bg-[#0891b2] rounded-full animate-pulse animation-delay-300"></div>
          <div className="absolute bottom-4 left-12 w-1 h-1 bg-[#13ead9] rounded-full animate-pulse animation-delay-600"></div>
        </div>

        {/* Audio bars */}
        <div className="flex gap-1 items-end h-full w-full justify-center p-3">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-100 ${
                isMicEnabled && level > 0.1
                  ? 'bg-gradient-to-t from-[#13ead9] to-[#0891b2]'
                  : 'bg-gradient-to-t from-gray-300 to-gray-400'
              }`}
              style={{
                height: `${Math.max(8, level * 70)}%`,
                opacity: isMicEnabled ? 0.8 + level * 0.2 : 0.3,
              }}
            />
          ))}
        </div>
        
        {/* Audio activity indicator */}
        {hasAudioActivity && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}

        {/* Shimmer effect when active */}
        {isMicEnabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#13ead9]/20 via-[#0891b2]/20 to-[#13ead9]/20 rounded-xl pointer-events-none opacity-50 animate-pulse"></div>
        )}
      </div>

      {/* Status Message */}
      <div className="text-center mt-4">
        <p className="text-sm text-slate-600 font-medium">
          {currentStatus.message}
        </p>
        
        {/* Additional context based on state */}
        {state === "listening" && (
          <p className="text-xs text-green-600 mt-1">
            Speak naturally and take your time to respond
          </p>
        )}
        
        {state === "thinking" && (
          <p className="text-xs text-amber-600 mt-1">
            Processing your response to provide relevant follow-up
          </p>
        )}
        
        {!isMicEnabled && (
          <p className="text-xs text-red-600 mt-1">
            Please unmute your microphone to continue
          </p>
        )}
      </div>

      {/* Audio Quality Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
          <div className="text-slate-500 mb-1">Audio Quality</div>
          <div className="font-semibold text-slate-700">
            {isMicEnabled ? 'Excellent' : 'No Input'}
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
          <div className="text-slate-500 mb-1">Session Time</div>
          <div className="font-mono font-semibold text-slate-700">
            {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
}

