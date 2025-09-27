import React from "react";
import {
  CpuChipIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useVoiceAssistant } from "@livekit/components-react";

interface InterviewHeaderProps {
  jobInfo?: { title?: string; description?: string; location?: string; experience?: string };
  companyInfo?: { name?: string; logo?: string };
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
    <div className="bg-gradient-to-r from-background/98 via-background/95 to-background/98 backdrop-blur-xl rounded-t-xl lg:rounded-t-3xl border-b border-border/40 shadow-lg">
      <div className="px-2 lg:px-8 py-2 lg:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-0">
          
          {/* Left Section - Brand & Interview Info - Simplified on mobile */}
          <div className="flex items-center gap-2 lg:gap-6">
            <div className="relative">
              <div className="w-10 h-10 lg:w-16 lg:h-16 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-lg lg:rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <CpuChipIcon className="w-5 h-5 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 lg:border-3 border-white animate-pulse shadow-lg"></div>
              <div className="absolute inset-0 rounded-lg lg:rounded-2xl border-2 border-[#13ead9]/30 animate-pulse"></div>
            </div>
            
            <div className="space-y-0.5 lg:space-y-1 min-w-0 flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3">
                <h1 className="text-sm lg:text-2xl font-bold text-foreground tracking-tight truncate">
                  {jobInfo?.title ? `${jobInfo.title}` : 'AI Interview'}
                </h1>
                <span className="px-1.5 lg:px-3 py-0.5 lg:py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20 self-start lg:self-auto">
                  LIVE
                </span>
              </div>
              
              {/* Hide detailed info on mobile */}
              <div className="hidden sm:flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#13ead9] rounded-full animate-pulse"></span>
                  <span className="font-medium">Rolevate AI Platform</span>
                </div>
                
                {companyInfo?.name && (
                  <>
                    <div className="hidden lg:block h-3 w-px bg-slate-300"></div>
                    <span className="text-slate-600 font-medium truncate">{companyInfo.name}</span>
                  </>
                )}
                
                {jobInfo?.location && (
                  <>
                    <div className="hidden lg:block h-3 w-px bg-slate-300"></div>
                    <span className="text-slate-500 truncate">{jobInfo.location}</span>
                  </>
                )}
                
                {participantName && (
                  <>
                    <div className="hidden lg:block h-3 w-px bg-slate-300"></div>
                    <span className="text-slate-600 truncate">Candidate: {participantName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Status & Controls - Simplified on mobile */}
          <div className="flex items-center gap-1.5 lg:gap-4 overflow-x-auto">
            
            {/* AI Status Indicator - Simplified on mobile */}
            <div className="flex items-center gap-1.5 lg:gap-3 px-2 lg:px-5 py-1.5 lg:py-3 bg-white/90 backdrop-blur-sm rounded-lg lg:rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 shrink-0">
              <div className="relative">
                <div className={`w-2.5 h-2.5 lg:w-4 lg:h-4 rounded-full ${currentStatus.bgColor} shadow-lg`}></div>
                <div className={`absolute inset-0 w-2.5 h-2.5 lg:w-4 lg:h-4 rounded-full ${currentStatus.bgColor} animate-ping opacity-75`}></div>
              </div>
              <div className="text-xs lg:text-sm">
                <div className="font-semibold text-slate-700">{currentStatus.text}</div>
                <div className="text-xs text-slate-500 hidden lg:block">AI Interviewer</div>
              </div>
            </div>
            
            {/* Session Timer - Compact on mobile */}
            <div className="flex items-center gap-1.5 lg:gap-3 px-2 lg:px-4 py-1.5 lg:py-3 bg-slate-50/90 backdrop-blur-sm rounded-lg lg:rounded-2xl border border-slate-200/50 shadow-lg shrink-0">
              <ClockIcon className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-slate-500" />
              <div className="text-xs lg:text-sm">
                <div className="font-mono font-semibold text-slate-700">
                  {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, "0")}
                </div>
                <div className="text-xs text-slate-500 hidden lg:block">Duration</div>
              </div>
            </div>

            {/* Interview Progress - Hidden on mobile and tablet */}
            {jobInfo?.title && (
              <div className="hidden xl:flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg shrink-0">
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