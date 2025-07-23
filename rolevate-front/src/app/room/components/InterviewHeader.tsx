import React from "react";
import {
  CpuChipIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useVoiceAssistant } from "@livekit/components-react";

interface InterviewHeaderProps {
  jobInfo?: any;
  companyInfo?: any;
  participantName?: string;
  sessionDuration: number;
}

export function InterviewHeader({
  jobInfo,
  companyInfo,
  participantName,
  sessionDuration,
}: InterviewHeaderProps) {
  const { state } = useVoiceAssistant();

  const statusInfo = {
    idle: { text: "Ready", color: "blue-500", bgColor: "bg-blue-500" },
    listening: { text: "Listening", color: "green-500", bgColor: "bg-green-500" },
    thinking: { text: "Processing", color: "amber-500", bgColor: "bg-amber-500" },
    speaking: { text: "Speaking", color: "purple-500", bgColor: "bg-purple-500" },
    disconnected: { text: "Reconnecting", color: "gray-500", bgColor: "bg-gray-500" },
  } as const;

  const currentStatus = statusInfo[state as keyof typeof statusInfo] || statusInfo.idle;

  return (
    <div className="bg-gradient-to-r from-white/98 via-slate-50/95 to-white/98 backdrop-blur-xl rounded-t-3xl border-b border-slate-200/40 shadow-lg">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          
          {/* Left Section - Brand & Interview Info */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <CpuChipIcon className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white animate-pulse shadow-lg"></div>
              <div className="absolute inset-0 rounded-2xl border-2 border-[#13ead9]/30 animate-pulse"></div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {jobInfo?.title ? `${jobInfo.title} Interview` : 'AI Interview Session'}
                </h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                  LIVE INTERVIEW
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#13ead9] rounded-full animate-pulse"></span>
                  <span className="font-medium">Rolevate AI Platform</span>
                </div>
                
                {companyInfo?.name && (
                  <>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <span className="text-slate-600 font-medium">{companyInfo.name}</span>
                  </>
                )}
                
                {jobInfo?.location && (
                  <>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <span className="text-slate-500">{jobInfo.location}</span>
                  </>
                )}
                
                {participantName && (
                  <>
                    <div className="h-3 w-px bg-slate-300"></div>
                    <span className="text-slate-600">Candidate: {participantName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Status & Controls */}
          <div className="flex items-center gap-4">
            
            {/* AI Status Indicator */}
            <div className="flex items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <div className={`w-4 h-4 rounded-full ${currentStatus.bgColor} shadow-lg`}></div>
                <div className={`absolute inset-0 w-4 h-4 rounded-full ${currentStatus.bgColor} animate-ping opacity-75`}></div>
              </div>
              <div className="text-sm">
                <div className="font-semibold text-slate-700">{currentStatus.text}</div>
                <div className="text-xs text-slate-500">AI Interviewer</div>
              </div>
            </div>
            
            {/* Session Timer */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg">
              <ClockIcon className="w-5 h-5 text-slate-500" />
              <div className="text-sm">
                <div className="font-mono font-semibold text-slate-700">
                  {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, "0")}
                </div>
                <div className="text-xs text-slate-500">Duration</div>
              </div>
            </div>

            {/* Interview Progress */}
            {jobInfo?.title && (
              <div className="hidden lg:flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg">
                <TrophyIcon className="w-5 h-5 text-blue-600" />
                <div className="text-sm">
                  <div className="font-semibold text-blue-700">Interview Active</div>
                  <div className="text-xs text-blue-600">{jobInfo.title}</div>
                  {companyInfo?.name && (
                    <div className="text-xs text-blue-500">{companyInfo.name}</div>
                  )}
                  {jobInfo?.experience && (
                    <div className="text-xs text-blue-400">{jobInfo.experience} experience</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}