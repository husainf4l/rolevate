"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InterviewRoom from "@/components/interview/InterviewRoom";
import { RoomService, RoomJoinRequest } from "@/services/room";

// This will come from your backend API
interface RoomData {
  token: string;
  roomName: string;
  serverUrl: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  phone: string;
  jobId: string;
  candidateId?: string;
  applicationId?: string;
}

function RoomContent() {
  const searchParams = useSearchParams();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  // Get query parameters
  const phone = searchParams.get("phone");
  const jobId = searchParams.get("jobId");
  const roomName = searchParams.get("roomName");

  useEffect(() => {
    // Validate required parameters
    if (!phone || !jobId || !roomName) {
      setError("Missing required parameters: phone, jobId, or roomName");
      setLoading(false);
      return;
    }

    // Fetch room data from backend
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate parameters
        const validationError = RoomService.validateRoomParams(phone, jobId, roomName);
        if (validationError) {
          setError(validationError);
          setLoading(false);
          return;
        }

        // Join the room via API
        const joinRequest: RoomJoinRequest = { phone, jobId, roomName };
        const response = await RoomService.joinRoom(joinRequest);

        const roomData: RoomData = {
          token: response.token,
          roomName: response.roomName,
          serverUrl: response.liveKitUrl,
          jobTitle: response.job.title,
          companyName: response.job.company,
          candidateName: response.participantName,
          phone: phone,
          jobId: jobId,
          candidateId: response.candidate.id,
          applicationId: response.application.id,
        };

        setRoomData(roomData);
        setCandidateId(response.candidate.id);
      } catch (err: any) {
        console.error("Error joining room:", err);
        setError(err.message || "Failed to join the interview room. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();

    // Cleanup function to leave room when component unmounts
    return () => {
      if (roomName && candidateId) {
        RoomService.leaveRoom(roomName, candidateId).catch(console.error);
      }
    };
  }, [phone, jobId, roomName, candidateId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Connecting to Interview Room
          </h2>
          <p className="text-gray-300">
            Please wait while we prepare your interview...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M6.938 4h10.124c1.54 0 2.502 1.667 1.732 2.5L13.732 20c-.77.833-1.964.833-2.732 0L4.268 6.5c-.77-.833.192-2.5 1.732-2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Unable to Join Room
          </h2>
          <p className="text-gray-300 mb-6">
            {error || "Failed to connect to the interview room."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success state - render the interview room
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Room Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-white">
              Interview Room
            </h1>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Live
            </span>
            <span className="text-gray-400 text-sm">
              {roomData.roomName}
            </span>
          </div>
          <div className="text-sm text-gray-300">
            <span>{roomData.jobTitle}</span>
            <span className="mx-2">•</span>
            <span>{roomData.companyName}</span>
            <span className="mx-2">•</span>
            <span>{roomData.candidateName}</span>
          </div>
        </div>
      </div>

      {/* Interview Room Component */}
      <InterviewRoom
        token={roomData.token}
        roomName={roomData.roomName}
        serverUrl={roomData.serverUrl}
        jobTitle={roomData.jobTitle}
        companyName={roomData.companyName}
        candidateName={roomData.candidateName}
      />
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white">
              Loading Interview Room...
            </h2>
          </div>
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
