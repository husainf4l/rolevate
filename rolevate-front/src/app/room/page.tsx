"use client";

import "@livekit/components-styles";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
    searchParams,
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
      token: searchParams.get("token"),
      roomName: searchParams.get("roomName"),
      serverUrl: searchParams.get("serverUrl"),
      phone: searchParams.get("phone"),
      jobId: searchParams.get("jobId"),
      allParams: Object.fromEntries(searchParams.entries()),
    });
  }, [searchParams]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
        <ParticleBackground />

        <InterviewLayout
          jobInfo={jobInfo}
          companyInfo={companyInfo}
          participantName={participantName}
        />

        <div className="fixed top-0 left-0 w-0 h-0 overflow-visible">
          <RoomAudioRenderer volume={1.0} muted={false} />
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
