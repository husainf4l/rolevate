import React, { useState, useEffect } from "react";
import { Track, TranscriptionSegment } from "livekit-client";
import {
  VideoCameraIcon,
  VideoCameraSlashIcon,
  TrophyIcon,
  ComputerDesktopIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MicrophoneIcon,
  XMarkIcon,
  LanguageIcon,
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
    return () => room.off('transcriptionReceived', handleTranscriptionReceived);
  }, [room, localParticipant]);

  return (
    <div className={`video-container relative aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/50 group ${
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

      {/* Live Captions Overlay */}
      {aiTranscript && showCaptions && (
        <div className="absolute bottom-16 left-4 right-4 z-40 pointer-events-none animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-black/85 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl border border-white/20 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed font-medium text-white/95">
                  {aiTranscript}
                  {!isTranscriptFinal && (
                    <span className="inline-block w-0.5 h-4 bg-white/70 ml-1 animate-pulse rounded-sm"></span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowCaptions(false)}
                className="flex-shrink-0 w-5 h-5 text-white/70 hover:text-white/90 transition-colors pointer-events-auto"
                title="Hide captions"
              >
                <XMarkIcon className="w-5 h-5" />
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

      {/* Quality Indicator */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-lg border border-white/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[3, 4, 2, 5].map((height, i) => (
                <div key={i} className={`w-0.5 bg-green-500 rounded-full`} style={{ height: `${height * 3}px` }} />
              ))}
            </div>
            {isScreenSharing ? '1440p' : '720p'}
          </div>
        </div>
        
        {!isCameraEnabled && (
          <div className="bg-blue-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg border border-blue-400/50">
            <div className="flex items-center gap-1.5">
              <TrophyIcon className="w-3 h-3" />
              <span>+15 pts</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Camera Enable Prompt Component
function CameraPrompt({ onEnableCamera }: { onEnableCamera: () => void }) {
  return (
    <div className="space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
        <VideoCameraIcon className="w-10 h-10 text-slate-500" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700">Camera Not Active</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Enable your camera for better engagement and communication during the interview.
        </p>
        
        <div className="bg-blue-50 border border-blue-200/50 rounded-xl p-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrophyIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">+15 points bonus</span>
          </div>
          <p className="text-xs text-blue-600 text-center">
            Better engagement score with video presence
          </p>
        </div>
      </div>
      
      <button
        onClick={onEnableCamera}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <VideoCameraIcon className="w-5 h-5" />
        Enable Camera
      </button>
    </div>
  );
}

// Screen Share Disabled Fallback
function ScreenSharePrompt() {
  return (
    <div className="space-y-4">
      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
        <ComputerDesktopIcon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-600 mb-2">Screen Share Disabled</h3>
      <p className="text-sm text-slate-500">
        Click the screen share button to show your presentation
      </p>
    </div>
  );
}