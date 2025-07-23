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
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        
        {/* Participant Badge */}
        <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Candidate</span>
            {isScreenSharing && (
              <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-blue-500/80 rounded-lg text-xs">
                <ComputerDesktopIcon className="w-3 h-3" />
                Screen
              </div>
            )}
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          
          {/* Microphone Toggle */}
          <button
            onClick={toggleMicrophone}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              isMicEnabled 
                ? 'bg-white/90 text-slate-700 hover:bg-white' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
            aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicEnabled ? (
              <MicrophoneIcon className="w-5 h-5" />
            ) : (
              <div className="relative">
                <MicrophoneIcon className="w-5 h-5" />
                <XMarkIcon className="w-3 h-3 absolute -top-0.5 -right-0.5 text-white" />
              </div>
            )}
          </button>
          
          {/* Camera Toggle */}
          <button
            onClick={toggleCamera}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              isCameraEnabled 
                ? 'bg-white/90 text-slate-700 hover:bg-white' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraEnabled ? (
              <VideoCameraIcon className="w-5 h-5" />
            ) : (
              <VideoCameraSlashIcon className="w-5 h-5" />
            )}
          </button>
          
          {/* Screen Share Toggle */}
          <button
            onClick={toggleScreenShare}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              isScreenSharing 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-white/90 text-slate-700 hover:bg-white'
            }`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          >
            <ComputerDesktopIcon className="w-5 h-5" />
          </button>
          
          {/* Captions Toggle */}
          <button
            onClick={onToggleCaptions}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              showCaptions 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-white/90 text-slate-700 hover:bg-white'
            }`}
            title={showCaptions ? 'Hide captions' : 'Show captions'}
            aria-label={showCaptions ? 'Hide captions' : 'Show captions'}
          >
            <LanguageIcon className="w-5 h-5" />
          </button>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 bg-white/90 hover:bg-white text-slate-700 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            title={isVideoFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-label={isVideoFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isVideoFullscreen ? (
              <ArrowsPointingInIcon className="w-5 h-5" />
            ) : (
              <ArrowsPointingOutIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}