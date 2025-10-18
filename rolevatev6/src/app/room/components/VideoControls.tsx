import React from "react";
import {
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface VideoControlsProps {
  mediaControls: any;
  showCaptions: boolean;
  onToggleCaptions: () => void;
}

export function VideoControls({
  mediaControls,
  showCaptions,
  onToggleCaptions,
}: VideoControlsProps) {
  const {
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    isVideoFullscreen,
    displayTrack,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    toggleFullscreen,
  } = mediaControls;

  // Only show controls when video is active
  if (!displayTrack || (!isCameraEnabled && !isScreenSharing)) {
    return null;
  }

  return (
    <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 z-30 ${
      isVideoFullscreen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
    }`}>
      <div className="absolute bottom-2 lg:bottom-4 left-2 lg:left-4 right-2 lg:right-4 flex items-center justify-between">
        
        {/* Participant Badge - Simplified on mobile */}
        <div className="bg-black/70 backdrop-blur-sm text-white px-2 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium">
          <div className="flex items-center gap-1 lg:gap-2">
            <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Candidate</span>
            <span className="sm:hidden">•</span>
            {isScreenSharing && (
              <div className="hidden sm:flex items-center gap-1 ml-2 px-2 py-1 bg-blue-500/80 rounded-lg text-xs">
                <ComputerDesktopIcon className="w-3 h-3" />
                Screen
              </div>
            )}
          </div>
        </div>
        
        {/* Control Buttons - Mobile optimized */}
        <div className="flex items-center gap-1 lg:gap-2">
          
          {/* Microphone Toggle - Mobile optimized */}
          <button
            onClick={toggleMicrophone}
            className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              isMicEnabled 
                ? 'bg-white/90 text-slate-700 hover:bg-white' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
            aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicEnabled ? (
              <MicrophoneIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <div className="relative">
                <MicrophoneIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                <XMarkIcon className="w-2.5 h-2.5 lg:w-3 lg:h-3 absolute -top-0.5 -right-0.5 text-white" />
              </div>
            )}
          </button>
          
          {/* Camera Toggle - Mobile optimized */}
          <button
            onClick={toggleCamera}
            className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              isCameraEnabled 
                ? 'bg-white/90 text-slate-700 hover:bg-white' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraEnabled ? (
              <VideoCameraIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <VideoCameraSlashIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
          </button>
          
          {/* Screen Share Toggle - Hidden on mobile */}
          <button
            onClick={toggleScreenShare}
            className={`hidden sm:flex w-8 h-8 lg:w-10 lg:h-10 rounded-full items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              isScreenSharing 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-white/90 text-slate-700 hover:bg-white'
            }`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          >
            <ComputerDesktopIcon className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          
          {/* Captions Toggle - Mobile optimized */}
          <button
            onClick={onToggleCaptions}
            className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              showCaptions 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-white/90 text-slate-700 hover:bg-white'
            }`}
            title={showCaptions ? 'Hide captions' : 'Show captions'}
            aria-label={showCaptions ? 'Hide captions' : 'Show captions'}
          >
            <LanguageIcon className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
          
          {/* Fullscreen Toggle - Hidden on mobile */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex w-8 h-8 lg:w-10 lg:h-10 bg-white/90 hover:bg-white text-slate-700 rounded-full items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            title={isVideoFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-label={isVideoFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isVideoFullscreen ? (
              <ArrowsPointingInIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            ) : (
              <ArrowsPointingOutIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

