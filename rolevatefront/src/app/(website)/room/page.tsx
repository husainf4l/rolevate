"use client";

import "@livekit/components-styles";
import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Room, RoomEvent } from "livekit-client";
import {
  RoomContext,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
} from "@livekit/components-react";
import Link from "next/link";
import { InterviewerAvatar } from "../../../components/interview/InterviewerAvatar";
import TranscriptionView from "../../../components/TranscriptionView";
import publicInterviewService, {
  PublicInterviewRoomInfo,
  CandidateJoinRequest,
  InterviewJoinResponse,
} from "../../../services/public-interview.service";

const visualizerStyles = `
  .agent-visualizer {
    --bar-color: #ffffff;
    --bar-color-active: #22c55e;
    width: 100%;
    height: 100%;
  }
`;

function RoomContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const [room] = useState(() => new Room());

  // Room and interview state
  const [roomInfo, setRoomInfo] = useState<PublicInterviewRoomInfo | null>(
    null
  );
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [interviewStatus, setInterviewStatus] = useState<
    | "loading"
    | "join_form"
    | "ready"
    | "connecting"
    | "waiting"
    | "active"
    | "completed"
    | "error"
  >("loading");

  // Candidate information state
  const [candidateJoined, setCandidateJoined] = useState(false);
  const [candidateDetails, setCandidateDetails] =
    useState<CandidateJoinRequest>({
      phoneNumber: "",
      firstName: "",
      lastName: "",
    });
  const [joinResponse, setJoinResponse] =
    useState<InterviewJoinResponse | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRoomInfo = useCallback(async () => {
    if (!roomCode) return;

    try {
      setLoading(true);
      const info = await publicInterviewService.getRoomInfo(roomCode);
      setRoomInfo(info);

      // Check if the interview is available for joining
      if (info.status === "COMPLETED" || info.status === "CANCELLED") {
        setError("This interview session is no longer available");
        setInterviewStatus("error");
      } else if (
        info.status === "SCHEDULED" ||
        info.status === "ACTIVE" ||
        info.status === "IN_PROGRESS"
      ) {
        setInterviewStatus("join_form");
      } else {
        setError("Interview status not recognized");
        setInterviewStatus("error");
      }
    } catch (err) {
      console.error("Error loading room info:", err);

      // If backend is not available and we have the demo room code, show demo data
      if (roomCode === "44FZU9BV") {
        console.log(
          "Backend not available, showing demo data for room:",
          roomCode
        );
        setRoomInfo({
          roomCode: "44FZU9BV",
          jobTitle: "Senior Backend Developer - Fintech",
          companyName: "MENA Bank",
          instructions:
            "Welcome to your technical interview for Banking position. Please speak clearly and answer the questions to the best of your ability.",
          maxDuration: 1800,
          status: "IN_PROGRESS",
          interviewType: "TECHNICAL",
        });
        setInterviewStatus("join_form");
        setError(
          "Demo mode: Backend not available. You can still test the interface."
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load interview room"
        );
        setInterviewStatus("error");
      }
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  // Load room info on mount
  useEffect(() => {
    if (!roomCode) {
      setError("No room code provided");
      setInterviewStatus("error");
      setLoading(false);
      return;
    }

    if (!publicInterviewService.validateRoomCode(roomCode)) {
      setError("Invalid room code format");
      setInterviewStatus("error");
      setLoading(false);
      return;
    }

    loadRoomInfo();
  }, [roomCode, loadRoomInfo]);

  // Handle candidate join form submission
  const handleJoinInterview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomCode || !roomInfo) return;

    // Validate form
    if (
      !candidateDetails.firstName.trim() ||
      !candidateDetails.lastName.trim() ||
      !candidateDetails.phoneNumber.trim()
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (
      !publicInterviewService.validatePhoneNumber(candidateDetails.phoneNumber)
    ) {
      setError("Please enter a valid phone number");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Format phone number
      const formattedPhone = publicInterviewService.formatPhoneNumber(
        candidateDetails.phoneNumber
      );

      const joinDetails: CandidateJoinRequest = {
        ...candidateDetails,
        phoneNumber: formattedPhone,
      };

      try {
        const response = await publicInterviewService.joinInterview(
          roomCode,
          joinDetails
        );

        // If we get a response with token and serverUrl, it means joining was successful
        if (response.token && response.serverUrl) {
          setJoinResponse(response);
          setCandidateJoined(true);
          setInterviewStatus("ready");
        } else {
          setError("Failed to join interview - invalid response");
        }
      } catch (apiError) {
        // If backend is not available and this is the demo room, create a mock response
        if (roomCode === "44FZU9BV") {
          console.log("Backend not available, creating demo join response");
          const mockResponse: InterviewJoinResponse = {
            token: "demo-token-123",
            serverUrl: "wss://demo-server.com",
            participantToken: "demo-participant-token-123",
            roomName: "interview_44FZU9BV",
            identity: `candidate_${Date.now()}`,
            roomCode: "44FZU9BV",
            participantName: `${candidateDetails.firstName} ${candidateDetails.lastName}`,
            jobTitle: "Senior Backend Developer - Fintech",
            instructions:
              "Welcome to your technical interview for Banking position. Please speak clearly and answer the questions to the best of your ability.",
            maxDuration: 1800,
          };

          setJoinResponse(mockResponse);
          setCandidateJoined(true);
          setInterviewStatus("ready");
          setError(
            "Demo mode: Backend not available. Interview interface will be shown without video connection."
          );
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Error joining interview:", err);
      setError(err instanceof Error ? err.message : "Failed to join interview");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallActive]);

  useEffect(() => {
    const handleError = (error: Error) => {
      console.error("LiveKit Error:", error);
      alert(
        "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
      );
    };
    room.on(RoomEvent.MediaDevicesError, handleError);
    return () => {
      room.off(RoomEvent.MediaDevicesError, handleError);
    };
  }, [room]);

  const startInterview = async () => {
    if (!joinResponse) {
      setError("No interview session available");
      return;
    }

    setInterviewStatus("connecting");
    try {
      await room.connect(
        joinResponse.serverUrl,
        joinResponse.participantToken // Use the participant token for LiveKit connection
      );
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsCallActive(true);

      setInterviewStatus("waiting");
      setTimeout(() => {
        setInterviewStatus("active");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to interview");
      setInterviewStatus("ready");
    }
  };

  const endInterview = async () => {
    if (!roomCode || !joinResponse) return;

    try {
      // Disconnect from the room first
      if (room.state === "connected") {
        room.disconnect();
      }

      // Notify backend
      await publicInterviewService.endInterview(roomCode, {
        sessionId: joinResponse.roomName, // Use roomName as session identifier
        candidateId: joinResponse.identity, // Use the identity from the response
      });

      setIsCallActive(false);
      setInterviewStatus("completed");
    } catch (err) {
      console.error("Error ending interview:", err);
      // Still update UI even if backend call fails
      setIsCallActive(false);
      setInterviewStatus("completed");
    }
  };

  const formatTime = (s: number): string => {
    return `${Math.floor(s / 60)}:${("0" + (s % 60)).slice(-2)}`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-xl font-semibold">Loading interview room...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (interviewStatus === "error" || (!roomCode && !loading)) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">
            {error || "Invalid Interview Link"}
          </p>
          <Link href="/" className="text-blue-400 underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show join form
  if (interviewStatus === "join_form" && roomInfo && !candidateJoined) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Join Interview</h1>
            <div className="space-y-1 text-gray-300">
              <p className="font-medium">{roomInfo.jobTitle}</p>
              <p className="text-sm">{roomInfo.companyName}</p>
              <p className="text-xs text-gray-400">
                {roomInfo.interviewType} • ~
                {Math.floor(roomInfo.maxDuration / 60)} minutes
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Demo Fill Button */}
          {roomCode === "44FZU9BV" && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setCandidateDetails({
                    phoneNumber: "+962798765432",
                    firstName: "New",
                    lastName: "Employee",
                  });
                }}
                className="w-full text-sm bg-blue-600/20 border border-blue-500/50 text-blue-300 py-2 px-3 rounded-lg hover:bg-blue-600/30 transition-colors"
              >
                🚀 Quick Fill Demo Data
              </button>
            </div>
          )}

          <form onSubmit={handleJoinInterview} className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={candidateDetails.firstName}
                onChange={(e) =>
                  setCandidateDetails((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your first name"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={candidateDetails.lastName}
                onChange={(e) =>
                  setCandidateDetails((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your last name"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={candidateDetails.phoneNumber}
                onChange={(e) =>
                  setCandidateDetails((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., +971501234567"
                required
                disabled={submitting}
              />
              <p className="text-xs text-gray-400 mt-1">
                Include country code (e.g., +971 for UAE)
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
            >
              {submitting ? "Joining..." : "Join Interview"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <style jsx global>
        {visualizerStyles}
      </style>
      <div className="h-screen bg-slate-900 text-white flex flex-col">
        {/* Interview Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-800 rounded-lg shadow-xl overflow-hidden">
            {/* Status Bar */}
            <div className="bg-slate-700 p-3 flex justify-between items-center">
              <span className="text-sm font-medium">
                Laila (AI Interviewer)
              </span>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-medium">
                  {interviewStatus.toUpperCase()}
                </span>
                {isCallActive && (
                  <div className="text-xs bg-red-500 px-2 py-0.5 rounded-full animate-pulse">
                    {formatTime(callDuration)}
                  </div>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="p-6 flex flex-col items-center space-y-6">
              {/* Room Info */}
              {roomInfo && (
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold">{roomInfo.jobTitle}</h2>
                  <p className="text-gray-300">{roomInfo.companyName}</p>
                </div>
              )}

              {/* Interviewer Avatar */}
              <div className="mb-2">
                <InterviewerAvatar isSpeaking={false} isActive={isCallActive} />
              </div>

              {/* Audio visualization */}
              {isCallActive && <AudioVisualizer />}

              {/* Transcription */}
              {isCallActive && <TranscriptionView />}

              {/* Error message */}
              {error && (
                <div className="w-full p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Controls */}
              <div className="w-full flex justify-center mt-6">
                {interviewStatus === "ready" && (
                  <button
                    className="bg-green-500 px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    onClick={startInterview}
                  >
                    Start Interview
                  </button>
                )}

                {interviewStatus === "connecting" && (
                  <div className="text-white px-6 py-2 flex items-center">
                    <span className="animate-pulse">Connecting...</span>
                  </div>
                )}

                {interviewStatus === "waiting" && (
                  <div className="text-yellow-300 px-6 py-2 flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Getting Ready...
                  </div>
                )}

                {interviewStatus === "active" && (
                  <button
                    className="bg-red-500 px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    onClick={endInterview}
                  >
                    End Interview
                  </button>
                )}

                {interviewStatus === "completed" && (
                  <Link
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Return to Home
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audio renderer for LiveKit */}
        <RoomAudioRenderer />
      </div>
    </RoomContext.Provider>
  );
}

function AudioVisualizer() {
  const { state: agentState, audioTrack } = useVoiceAssistant();

  return (
    <div className="w-full max-w-[300px] h-[100px] mb-4">
      <BarVisualizer
        state={agentState}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
