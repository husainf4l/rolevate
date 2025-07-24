import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
  const [showExitModal, setShowExitModal] = useState(false);
  const mediaControls = useMediaControls();
  const router = useRouter();

  const handleCloseInterview = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    // Clean up resources before leaving
    try {
      // Stop all media tracks
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {
          // Ignore errors if no stream exists
        });
    } catch (error) {
      console.warn("Error cleaning up media:", error);
    }
    
    // Navigate back to jobs or dashboard
    router.push('/jobs');
  };

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mobile cleanup effect to prevent memory leaks
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      return; // No cleanup needed for desktop
    }

    // Add mobile-specific cleanup
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("📱 App backgrounded on mobile, maintaining minimal state");
      } else {
        console.log("📱 App foregrounded on mobile, resuming normal operation");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative z-10 flex-1 flex items-center justify-center p-0 sm:p-2 lg:p-6 xl:p-8">
      <div className="w-full max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
        
        {/* Enhanced Professional Header - Minimal on mobile */}
        <InterviewHeader
          jobInfo={jobInfo}
          companyInfo={companyInfo}
          {...(participantName && { participantName })}
          sessionDuration={sessionDuration}
        />

        {/* Main Content Grid - Full screen video on mobile */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-0 lg:gap-6 p-0 lg:p-6 bg-transparent sm:bg-white/95 backdrop-blur-none sm:backdrop-blur-xl rounded-none sm:rounded-b-xl lg:rounded-b-3xl shadow-none sm:shadow-2xl border-0 sm:border border-white/30">
          
          {/* Video Section - Almost full screen on mobile */}
          <div className="xl:col-span-2 space-y-3 lg:space-y-6 order-1 px-4 sm:px-0">
            <VideoPanel mediaControls={mediaControls} />
            
            {/* End Interview Button - Standard red button */}
            <div className="flex justify-center">
              <button
                onClick={handleCloseInterview}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 min-w-[160px] justify-center"
              >
                <XMarkIcon className="w-5 h-5" />
                End Interview
              </button>
            </div>
            
            {/* Hide audio visualization on mobile to save space and prevent crashes */}
            <div className="hidden sm:block">
              <AudioVisualization 
                isMicEnabled={mediaControls.isMicEnabled}
                sessionDuration={sessionDuration}
              />
            </div>
          </div>

          {/* AI Assistant Panel - Hidden on mobile screens */}
          <div className="hidden lg:block order-first xl:order-last">
            <AIAssistantPanel sessionDuration={sessionDuration} />
          </div>
        </div>
      </div>

      {/* Exit Interview Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XMarkIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                End Interview?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to leave the interview? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}