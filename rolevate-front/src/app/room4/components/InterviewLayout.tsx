import React, { useState, useEffect } from "react";
import { InterviewHeader } from "./InterviewHeader";
import { VideoPanel } from "./VideoPanel";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { AudioVisualization } from "./AudioVisualization";
import { useMediaControls } from "../hooks/useMediaControls";

interface InterviewLayoutProps {
  jobInfo?: any;
  companyInfo?: any;
  participantName?: string;
}

export function InterviewLayout({
  jobInfo,
  companyInfo,
  participantName,
}: InterviewLayoutProps) {
  const [sessionDuration, setSessionDuration] = useState(0);
  const mediaControls = useMediaControls();

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
        
        {/* Enhanced Professional Header */}
        <InterviewHeader
          jobInfo={jobInfo}
          companyInfo={companyInfo}
          participantName={participantName}
          sessionDuration={sessionDuration}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-white/95 backdrop-blur-xl rounded-b-3xl shadow-2xl border border-white/30">
          
          {/* Video and Audio Section */}
          <div className="lg:col-span-2 space-y-6">
            <VideoPanel mediaControls={mediaControls} />
            <AudioVisualization 
              isMicEnabled={mediaControls.isMicEnabled}
              sessionDuration={sessionDuration}
            />
          </div>

          {/* AI Assistant Panel */}
          <div>
            <AIAssistantPanel sessionDuration={sessionDuration} />
          </div>
        </div>
      </div>
    </div>
  );
}