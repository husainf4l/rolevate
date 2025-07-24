import React, { useState, useEffect } from "react";
import { TranscriptionSegment } from "livekit-client";
import {
  VideoCameraIcon,
  TrophyIcon,
  ComputerDesktopIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { VideoTrack, useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { VideoControls } from "./VideoControls";

interface VideoPanelProps {
  mediaControls: any;
}

export function VideoPanel({ mediaControls }: VideoPanelProps) {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [aiTranscript, setAiTranscript] = useState<string>("");
  const [showCaptions, setShowCaptions] = useState(true);
  const [isTranscriptFinal, setIsTranscriptFinal] = useState<boolean>(false);

  const {
    isCameraEnabled,
    isScreenSharing,
    isVideoFullscreen,
    displayTrack,
    displaySource,
    toggleCamera,
  } = mediaControls;

  // Listen for AI transcriptions
  useEffect(() => {
    if (!room) return;

    const handleTranscriptionReceived = (segments: TranscriptionSegment[], participant: any) => {
      if (participant && participant !== localParticipant) {
        const streamingText = segments.map(segment => segment.text).join(' ');
        
        if (streamingText.trim()) {
          setAiTranscript(streamingText);
          const hasFinalSegment = segments.some(segment => segment.final);
          setIsTranscriptFinal(hasFinalSegment);
          
          if (hasFinalSegment) {
            setTimeout(() => {
              setAiTranscript("");
              setIsTranscriptFinal(false);
            }, 5000);
          }
        }
      }
    };

    room.on('transcriptionReceived', handleTranscriptionReceived);
    return () => {
      room.off('transcriptionReceived', handleTranscriptionReceived);
    };
  }, [room, localParticipant]);

  return (
    <div className={`video-container relative aspect-video sm:aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-none sm:rounded-2xl overflow-hidden shadow-none sm:shadow-xl border-0 sm:border border-slate-200/50 group min-h-[70vh] sm:min-h-0 w-full ${
      isVideoFullscreen ? 'fullscreen-container' : ''
    }`}>
      
      {/* Video Content */}
      {displayTrack && (isCameraEnabled || isScreenSharing) ? (
        <VideoTrack
          trackRef={{
            publication: localParticipant.getTrackPublication(displaySource)!,
            source: displaySource,
            participant: localParticipant,
          }}
          className={`w-full h-full ${isVideoFullscreen ? 'fullscreen-video' : 'object-cover'}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 relative z-10">
          <div className="text-center text-slate-500 max-w-md px-6 relative z-20">
            {!isCameraEnabled ? (
              <CameraPrompt onEnableCamera={toggleCamera} />
            ) : (
              <ScreenSharePrompt />
            )}
          </div>
        </div>
      )}

      {/* Live Captions Overlay - Mobile optimized */}
      {aiTranscript && showCaptions && (
        <div className="absolute bottom-12 lg:bottom-16 left-2 right-2 lg:left-4 lg:right-4 z-40 pointer-events-none animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-black/90 backdrop-blur-sm text-white px-2 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl shadow-2xl border border-white/20 max-w-3xl mx-auto">
            <div className="flex items-start gap-2 lg:gap-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm leading-relaxed font-medium text-white/95">
                  {aiTranscript}
                  {!isTranscriptFinal && (
                    <span className="inline-block w-0.5 h-3 lg:h-4 bg-white/70 ml-1 animate-pulse rounded-sm"></span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowCaptions(false)}
                className="flex-shrink-0 w-4 h-4 lg:w-5 lg:h-5 text-white/70 hover:text-white/90 transition-colors pointer-events-auto"
                title="Hide captions"
              >
                <XMarkIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Controls */}
      <VideoControls
        mediaControls={mediaControls}
        showCaptions={showCaptions}
        onToggleCaptions={() => setShowCaptions(!showCaptions)}
      />

      {/* Quality Indicator - Hidden on mobile */}
      <div className="absolute top-2 lg:top-4 right-2 lg:right-4 flex flex-col gap-1 lg:gap-2">
        <div className="hidden sm:block bg-white/90 backdrop-blur-sm px-2 lg:px-3 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-lg border border-white/50">
          <div className="flex items-center gap-1 lg:gap-2">
            <div className="flex gap-0.5">
              {[3, 4, 2, 5].map((height, i) => (
                <div key={i} className={`w-0.5 bg-green-500 rounded-full`} style={{ height: `${height * 3}px` }} />
              ))}
            </div>
            {isScreenSharing ? '1440p' : '720p'}
          </div>
        </div>
        
        {!isCameraEnabled && (
          <div className="hidden sm:block bg-blue-500/90 backdrop-blur-sm px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-xs font-medium text-white shadow-lg border border-blue-400/50">
            <div className="flex items-center gap-1 lg:gap-1.5">
              <TrophyIcon className="w-3 h-3" />
              <span>+15 pts</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Camera Enable Prompt Component - Mobile optimized
function CameraPrompt({ onEnableCamera }: { onEnableCamera: () => void }) {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg animate-pulse">
        <VideoCameraIcon className="w-8 h-8 lg:w-10 lg:h-10 text-slate-500" />
      </div>
      
      <div className="space-y-3 lg:space-y-4">
        <h3 className="text-base lg:text-lg font-semibold text-slate-700">Camera Not Active</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Enable your camera for better engagement during the interview.
        </p>
        
        <div className="bg-blue-50 border border-blue-200/50 rounded-lg lg:rounded-xl p-2 lg:p-3">
          <div className="flex items-center justify-center gap-1.5 lg:gap-2 mb-1">
            <TrophyIcon className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
            <span className="text-xs lg:text-sm font-medium text-blue-700">+15 points bonus</span>
          </div>
          <p className="text-xs text-blue-600 text-center">
            Better engagement score with video
          </p>
        </div>
      </div>
      
      <button
        onClick={onEnableCamera}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2 lg:gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <VideoCameraIcon className="w-4 h-4 lg:w-5 lg:h-5" />
        Enable Camera
      </button>
    </div>
  );
}

// Screen Share Disabled Fallback - Mobile optimized
function ScreenSharePrompt() {
  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg animate-pulse">
        <ComputerDesktopIcon className="w-8 h-8 lg:w-10 lg:h-10 text-slate-400" />
      </div>
      <h3 className="text-base lg:text-lg font-semibold text-slate-600 mb-2">Screen Share Disabled</h3>
      <p className="text-sm text-slate-500">
        Use screen share button to show your presentation
      </p>
    </div>
  );
}