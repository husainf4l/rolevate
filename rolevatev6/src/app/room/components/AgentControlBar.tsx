'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRoomContext, useRemoteParticipants } from '@livekit/components-react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentControlBarProps {
  onChatOpenChange?: (open: boolean) => void;
}

export function AgentControlBar({ onChatOpenChange }: AgentControlBarProps) {
  const room = useRoomContext();
  const participants = useRemoteParticipants();
  const [isMounted, setIsMounted] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    room.disconnect();
  }, [room]);

  const toggleMicrophone = useCallback(async () => {
    try {
      const localParticipant = room.localParticipant;
      await localParticipant.setMicrophoneEnabled(!isMicEnabled);
      setIsMicEnabled(!isMicEnabled);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  }, [room, isMicEnabled]);

  const toggleCamera = useCallback(async () => {
    try {
      const localParticipant = room.localParticipant;
      await localParticipant.setCameraEnabled(!isCameraEnabled);
      setIsCameraEnabled(!isCameraEnabled);
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  }, [room, isCameraEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      const localParticipant = room.localParticipant;
      await localParticipant.setScreenShareEnabled(!isScreenSharing);
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  }, [room, isScreenSharing]);

  const isAgentAvailable = participants.some((p) => p.isAgent);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center w-full">
        <div className="bg-white/5 backdrop-blur-2xl rounded-full flex items-center gap-0.5 md:gap-1 p-1.5 md:p-2 border border-white/10">
          <div className="h-11 w-11 md:h-12 md:w-12 bg-white/5 rounded-full animate-pulse" />
          <div className="h-11 w-11 md:h-12 md:w-12 bg-white/5 rounded-full animate-pulse" />
          <div className="h-11 w-11 md:h-12 md:w-12 bg-white/5 rounded-full animate-pulse" />
          <div className="h-6 md:h-8 w-px bg-white/10 mx-0.5 md:mx-1"></div>
          <div className="h-11 w-11 md:h-12 md:w-12 bg-red-500/20 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="bg-white/5 backdrop-blur-2xl rounded-full flex items-center gap-0.5 md:gap-1 p-1.5 md:p-2 shadow-2xl border border-white/10">
        {/* Microphone */}
        <button
          onClick={toggleMicrophone}
          disabled={!room}
          className={cn(
            'relative h-11 w-11 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all duration-200',
            'hover:bg-white/10 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isMicEnabled ? 'bg-white/5' : 'bg-red-500/90 shadow-lg shadow-red-500/30'
          )}
          aria-label={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicEnabled ? (
            <Mic className="h-4 w-4 md:h-5 md:w-5 text-white" />
          ) : (
            <MicOff className="h-4 w-4 md:h-5 md:w-5 text-white" />
          )}
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          disabled={!room}
          className={cn(
            'relative h-11 w-11 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all duration-200',
            'hover:bg-white/10 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isCameraEnabled ? 'bg-white/5' : 'bg-white/5'
          )}
          aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraEnabled ? (
            <Video className="h-4 w-4 md:h-5 md:w-5 text-white" />
          ) : (
            <VideoOff className="h-4 w-4 md:h-5 md:w-5 text-white/50" />
          )}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          disabled={!room}
          className={cn(
            'relative h-11 w-11 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all duration-200',
            'hover:bg-white/10 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isScreenSharing ? 'bg-blue-500/90 shadow-lg shadow-blue-500/30' : 'bg-white/5'
          )}
          aria-label={isScreenSharing ? 'Stop screen share' : 'Start screen share'}
        >
          {isScreenSharing ? (
            <MonitorOff className="h-4 w-4 md:h-5 md:w-5 text-white" />
          ) : (
            <Monitor className="h-4 w-4 md:h-5 md:w-5 text-white" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 md:h-8 w-px bg-white/10 mx-0.5 md:mx-1"></div>

        {/* Disconnect */}
        <button
          onClick={handleDisconnect}
          disabled={!room}
          className={cn(
            'relative h-11 w-11 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all duration-200',
            'hover:bg-red-500/90 hover:shadow-lg hover:shadow-red-500/30 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-red-500/20'
          )}
          aria-label="Disconnect"
        >
          <PhoneOff className="h-4 w-4 md:h-5 md:w-5 text-white" />
        </button>
      </div>
    </div>
  );
}
