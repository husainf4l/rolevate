"use client";

import "@livekit/components-styles";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, ReadonlyURLSearchParams } from "next/navigation";
import { Room } from "livekit-client";
import { RoomContext, RoomAudioRenderer } from "@livekit/components-react";
import ParticleBackground from "@/components/interview/ParticleBackground";
import { InterviewLayout } from "./components/InterviewLayout";
import { ConnectionManager } from "./components/ConnectionManager";
import { useInterviewState } from "./hooks/useInterviewState";
import { useRoomConnection } from "./hooks/useRoomConnection";

function Room4Content() {
  const searchParams = useSearchParams();
  const [room] = useState(() => new Room());
  const connectionAttemptedRef = useRef(false);

  // Create fallback for searchParams if null
  const safeSearchParams = searchParams || (new URLSearchParams() as ReadonlyURLSearchParams);

  const {
    isConnected,
    isConnecting,
    error,
    needsPermission,
    participantName,
    companyInfo,
    jobInfo,
    handleStartInterview,
    setIsConnected,
    setIsConnecting,
    setError,
    setJobInfo,
    setCompanyInfo,
    setParticipantName,
  } = useInterviewState();

  const { connectToRoom } = useRoomConnection({
    room,
    searchParams: safeSearchParams,
    onConnectionChange: (connected, connecting) => {
      setIsConnected(connected);
      setIsConnecting(connecting);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    },
    onJobDataUpdate: (jobData, companyData, participantData) => {
      if (jobData) setJobInfo(jobData);
      if (companyData) setCompanyInfo(companyData);
      if (participantData) setParticipantName(participantData);
    },
  });

  // Debug URL parameters
  useEffect(() => {
    console.log("🔍 URL Parameters:", {
      token: safeSearchParams.get("token"),
      roomName: safeSearchParams.get("roomName"),
      serverUrl: safeSearchParams.get("serverUrl"),
      phone: safeSearchParams.get("phone"),
      jobId: safeSearchParams.get("jobId"),
      allParams: Object.fromEntries(safeSearchParams.entries()),
    });
  }, [safeSearchParams]);

  // Connect to room when permissions are granted
  useEffect(() => {
    console.log("🔍 Connection effect triggered:", {
      needsPermission,
      isConnected,
      isConnecting,
      hasError: !!error,
      connectionAttempted: connectionAttemptedRef.current,
    });

    if (
      !needsPermission &&
      !isConnected &&
      !isConnecting &&
      !error &&
      !connectionAttemptedRef.current
    ) {
      console.log("🚀 Triggering room connection...");
      connectionAttemptedRef.current = true;
      connectToRoom();
    }
  }, [needsPermission, isConnected, isConnecting, error, connectToRoom]);

  if (needsPermission || error || isConnecting || !isConnected) {
    return (
      <ConnectionManager
        needsPermission={needsPermission}
        error={error}
        isConnecting={isConnecting}
        isConnected={isConnected}
        onStartInterview={handleStartInterview}
      />
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <div className="min-h-screen bg-slate-50 relative overflow-hidden">
        <ParticleBackground />

        <InterviewLayout
          jobInfo={jobInfo}
          companyInfo={companyInfo}
          participantName={participantName}
        />

        <div className="fixed top-0 left-0 w-0 h-0 overflow-visible">
          <RoomAudioRenderer volume={1.0} muted={false} />
        </div>

        {/* Mobile-specific audio enhancement */}
        <div className="sm:hidden fixed bottom-0 left-0 w-full h-0 overflow-visible">
          <audio 
            autoPlay 
            playsInline 
            style={{ display: 'none' }}
            ref={(audio) => {
              if (audio && room) {
                // Enhanced audio settings for mobile clarity
                audio.volume = 1.0;
                audio.preload = 'auto';
                
                // Mobile-specific audio optimizations
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobile) {
                  // Force audio context resume on mobile interaction
                  const resumeAudio = () => {
                    if (audio.paused) {
                      audio.play().catch(console.warn);
                    }
                  };
                  
                  document.addEventListener('touchstart', resumeAudio, { once: true });
                  document.addEventListener('click', resumeAudio, { once: true });
                }
              }
            }}
          />
        </div>
      </div>
    </RoomContext.Provider>
  );
}

export default function Room4Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Room4Content />
    </Suspense>
  );
}

