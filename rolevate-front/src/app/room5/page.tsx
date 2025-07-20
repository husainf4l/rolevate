"use client";

import "@livekit/components-styles";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Room } from "livekit-client";
import { RoomContext, RoomAudioRenderer } from "@livekit/components-react";
import { InterviewLayout } from "./components/InterviewLayout";
import { ConnectionManager } from "./components/ConnectionManager";
import { useInterviewState } from "./hooks/useInterviewState";
import { useRoomConnection } from "./hooks/useRoomConnection";
import { AIAssistantPanel } from "./components/AIAssistantPanel";
import { InterviewHeader } from "./components/InterviewHeader";
import { VideoPanel } from "./components/VideoPanel";

export default function Room5Page() {
  const searchParams = useSearchParams();
  const [room] = useState(() => new Room());
  const connectionAttemptedRef = useRef(false);

  const {
    isConnected,
    isConnecting,
    error,
    needsPermission,
    handleStartInterview,
    setIsConnected,
    setIsConnecting,
    setError,
    setJobInfo,
    setCompanyInfo,
    setParticipantName,
  } = useInterviewState();

  const roomConnection = useRoomConnection({
    room,
    searchParams,
    onConnectionChange: (connected, connecting) => {
      setIsConnected(connected);
      setIsConnecting(connecting);
    },
    onError: setError,
    onJobDataUpdate: (jobData, companyData, participantData) => {
      setJobInfo(jobData);
      setCompanyInfo(companyData);
      setParticipantName(participantData);
    },
  });

  useEffect(() => {
    if (
      !connectionAttemptedRef.current &&
      searchParams.get("roomName") &&
      searchParams.get("token")
    ) {
      handleStartInterview(async () => {
        await roomConnection.connectToRoom();
      });
      connectionAttemptedRef.current = true;
    }
  }, [searchParams, handleStartInterview, roomConnection]);

  if (error || needsPermission || isConnecting || !isConnected) {
    return (
      <ConnectionManager
        needsPermission={needsPermission}
        error={error}
        isConnecting={isConnecting}
        isConnected={isConnected}
        onStartInterview={() =>
          handleStartInterview(async () => {
            await roomConnection.connectToRoom();
          })
        }
      />
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <InterviewLayout
        header={<InterviewHeader />}
        videoPanel={<VideoPanel />}
        aiAssistantPanel={<AIAssistantPanel />}
      >
        <RoomAudioRenderer />
      </InterviewLayout>
    </RoomContext.Provider>
  );
}
