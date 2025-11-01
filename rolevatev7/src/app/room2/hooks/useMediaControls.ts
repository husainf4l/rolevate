import { useState, useCallback, useEffect } from "react";
import { Track } from "livekit-client";
import { useLocalParticipant } from "@livekit/components-react";

export function useMediaControls() {
  const { localParticipant } = useLocalParticipant();
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Sync state with actual track states
  useEffect(() => {
    const micPublication = localParticipant.getTrackPublication(Track.Source.Microphone);
    const cameraPublication = localParticipant.getTrackPublication(Track.Source.Camera);
    const screenPublication = localParticipant.getTrackPublication(Track.Source.ScreenShare);

    setIsMicEnabled(micPublication?.isEnabled ?? true);
    setIsCameraEnabled(cameraPublication?.isEnabled ?? true);
    setIsScreenSharing(screenPublication?.isEnabled ?? false);
  }, [localParticipant]);

  const toggleMicrophone = useCallback(async () => {
    try {
      // Add mobile-specific handling to prevent crashes
      if (isMobile) {
        // Small delay on mobile to prevent rapid state changes
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await localParticipant.setMicrophoneEnabled(!isMicEnabled);
      setIsMicEnabled(!isMicEnabled);
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
      // Try to recover the state if toggle fails
      const micPublication = localParticipant.getTrackPublication(Track.Source.Microphone);
      setIsMicEnabled(micPublication?.isEnabled ?? false);
    }
  }, [localParticipant, isMicEnabled, isMobile]);

  const toggleCamera = useCallback(async () => {
    try {
      if (!isCameraEnabled) {
        // Use lower resolution on mobile to reduce memory usage
        const constraints = isMobile ?
          { resolution: { width: 640, height: 480, frameRate: 15 } } :
          { resolution: { width: 1280, height: 720, frameRate: 30 } };

        await localParticipant.setCameraEnabled(true, constraints);
      } else {
        await localParticipant.setCameraEnabled(false);
      }
      setIsCameraEnabled(!isCameraEnabled);
    } catch (error) {
      console.error("Failed to toggle camera:", error);
    }
  }, [localParticipant, isCameraEnabled, isMobile]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        // Use lower settings on mobile for screen sharing
        const constraints = isMobile ?
          { resolution: { width: 1280, height: 720, frameRate: 10 } } :
          { resolution: { width: 2560, height: 1440, frameRate: 15 } };

        await localParticipant.setScreenShareEnabled(true, constraints);
      } else {
        await localParticipant.setScreenShareEnabled(false);
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
    }
  }, [localParticipant, isScreenSharing, isMobile]);

  const toggleFullscreen = useCallback(async () => {
    const videoContainer = document.querySelector('.video-container') as HTMLElement;

    if (!document.fullscreenElement) {
      try {
        await videoContainer?.requestFullscreen();
        setIsVideoFullscreen(true);
      } catch (err) {
        console.error('Failed to enter fullscreen:', err);
        setIsVideoFullscreen(true);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsVideoFullscreen(false);
      } catch (err) {
        console.error('Failed to exit fullscreen:', err);
        setIsVideoFullscreen(false);
      }
    }
  }, []);

  // Handle fullscreen changes and escape key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVideoFullscreen) {
        setIsVideoFullscreen(false);
      }
    };

    const handleFullscreenChange = () => {
      setIsVideoFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isVideoFullscreen]);

  // Get current tracks
  const localVideoTrack = localParticipant.getTrackPublication(Track.Source.Camera)?.track;
  const localScreenTrack = localParticipant.getTrackPublication(Track.Source.ScreenShare)?.track;
  const displayTrack = localScreenTrack || localVideoTrack;
  const displaySource = localScreenTrack ? Track.Source.ScreenShare : Track.Source.Camera;

  return {
    // State
    isMicEnabled,
    isCameraEnabled,
    isScreenSharing,
    isVideoFullscreen,
    localVideoTrack,
    localScreenTrack,
    displayTrack,
    displaySource,

    // Actions
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
    toggleFullscreen,

    // Direct setters
    setIsVideoFullscreen
  };
}