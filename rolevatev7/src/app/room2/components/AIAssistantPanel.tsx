import React from "react";
import { PhoneXMarkIcon } from "@heroicons/react/24/outline";
import { useVoiceAssistant } from "@livekit/components-react";

interface AIAssistantPanelProps {
  sessionDuration: number;
}

export function AIAssistantPanel({ sessionDuration }: AIAssistantPanelProps) {
  const { state } = useVoiceAssistant();

  const statusInfo = {
    idle: {
      text: "Ready",
      bgColor: "bg-blue-500",
      message: "Interview session is ready",
    },
    listening: {
      text: "Listening",
      bgColor: "bg-green-500",
      message: "Actively listening to your response",
    },
    thinking: {
      text: "Processing",
      bgColor: "bg-amber-500",
      message: "Analyzing your response",
    },
    speaking: {
      text: "Speaking",
      bgColor: "bg-purple-500",
      message: "AI interviewer is responding",
    },
    disconnected: {
      text: "Reconnecting",
      bgColor: "bg-gray-500",
      message: "Attempting to reconnect",
    },
  } as const;

  const currentStatus = statusInfo[state as keyof typeof statusInfo] || statusInfo.idle;

  const handleEndInterview = () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to end the interview?')) {
      window.parent.postMessage({ type: 'END_INTERVIEW' }, '*');
      window.location.href = '/';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* AI Avatar Section */}
      <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-sm p-6 border border-slate-200/50 shadow-lg text-center">
        
        {/* AI Avatar */}
        <div className="relative w-28 h-28 mx-auto mb-6 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center shadow-xl">
            <span className="text-2xl font-bold text-white">AI</span>
          </div>

          {/* State Indicators */}
          {state === "speaking" && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-bounce">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          )}

          {state === "listening" && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}

          {state === "thinking" && (
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-spin">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* AI Info */}
        <h3 className="text-xl font-bold text-slate-800 mb-2">AI Executive Interviewer</h3>
        <p className="text-slate-600 mb-4 leading-relaxed">{currentStatus.message}</p>
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
          <div className={`w-2 h-2 rounded-full ${currentStatus.bgColor} animate-pulse`}></div>
          <span className="text-sm font-medium text-slate-700">{currentStatus.text}</span>
        </div>
      </div>

      {/* Session Information Panel */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-sm p-6 border border-blue-200/50 shadow-lg">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Session Information</h4>
        
        <div className="space-y-3">
          
          {/* Duration */}
          <div className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
            <span className="text-sm text-slate-600">Duration</span>
            <span className="text-sm font-mono font-semibold text-slate-800">
              {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, "0")}
            </span>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
            <span className="text-sm text-slate-600">Connection</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Secure</span>
            </div>
          </div>
          
          {/* Audio Quality */}
          <div className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
            <span className="text-sm text-slate-600">Audio Quality</span>
            <span className="text-sm font-medium text-blue-700">Excellent</span>
          </div>

          {/* AI Response Quality */}
          <div className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
            <span className="text-sm text-slate-600">AI Performance</span>
            <span className="text-sm font-medium text-purple-700">Optimal</span>
          </div>
        </div>
        
        {/* Performance Insights */}
        <div className="mt-4 p-3 bg-white/50 rounded-lg border border-blue-200/30">
          <h5 className="text-sm font-semibold text-blue-800 mb-2">Live Assessment</h5>
          <p className="text-xs text-blue-700 leading-relaxed">
            Demonstrating strong communication skills with clear articulation and thoughtful responses. 
            Maintaining excellent professional presence throughout the session.
          </p>
        </div>
        
        {/* End Interview Button */}
        <button
          onClick={handleEndInterview}
          className="w-full mt-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <PhoneXMarkIcon className="w-5 h-5" />
          End Interview
        </button>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-sm p-4 border border-green-200/50 shadow-lg">
        <h4 className="text-sm font-semibold text-green-800 mb-2">Interview Tips</h4>
        <ul className="text-xs text-green-700 space-y-1">
          <li>• Speak clearly and at a moderate pace</li>
          <li>• Take time to think before responding</li>
          <li>• Use specific examples when possible</li>
          <li>• Ask clarifying questions if needed</li>
        </ul>
      </div>
    </div>
  );
}

