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
  const phoneNumber = searchParams.get("phoneNumber");
  const jobId = searchParams.get("jobId");
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
      firstName: "", // Not used but keeping for interface compatibility
      lastName: "", // Not used but keeping for interface compatibility
    });
  const [joinResponse, setJoinResponse] =
    useState<InterviewJoinResponse | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRoomInfo = useCallback(async () => {
    if (!phoneNumber || !jobId) return;

    try {
      setLoading(true);

      // For non-demo, we'll let createAndJoinRoom handle everything
      setInterviewStatus("join_form");
    } catch (err) {
      console.error("Error loading room info:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load interview room"
      );
      setInterviewStatus("error");
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, jobId]);

  // Load room info on mount
  useEffect(() => {
    if (!phoneNumber || !jobId) {
      setError("Missing phone number or job ID in URL");
      setInterviewStatus("error");
      setLoading(false);
      return;
    }

    // Pre-fill phone number from URL
    setCandidateDetails((prev) => ({
      ...prev,
      phoneNumber: phoneNumber,
    }));

    loadRoomInfo();
  }, [phoneNumber, jobId, loadRoomInfo]);

  // Handle candidate join form submission
  const handleJoinInterview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !jobId) return;

    // Validate form
    if (!candidateDetails.phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      console.log("=== STARTING INTERVIEW JOIN PROCESS ===");
      console.log("Job ID from URL:", jobId);
      console.log("Phone Number from URL:", candidateDetails.phoneNumber);

      // Format phone number
      const formattedPhone = publicInterviewService.formatPhoneNumber(
        candidateDetails.phoneNumber
      );
      console.log("Formatted phone number:", formattedPhone);

      // Single API call - create room and get access
      console.log("Calling createAndJoinRoom API...");
      const response = await publicInterviewService.createAndJoinRoom({
        jobPostId: jobId, // Use jobId from URL parameter
        phoneNumber: formattedPhone,
      });

      console.log("=== BACKEND RESPONSE RECEIVED ===");
      console.log("Response:", response);
      console.log("Backend says room name:", response.roomName);
      console.log("Backend says server URL (old):", response.serverUrl);
      console.log("Backend says WS URL (new):", response.wsUrl);
      console.log("Backend says identity:", response.identity);
      console.log("Backend says status:", response.status);
      console.log(
        "Backend says token:",
        response.token ? "present" : "missing"
      );
      console.log(
        "Backend says participantToken:",
        response.participantToken ? "present" : "missing"
      );
      console.log("===================================");

      // Update room info from response
      setRoomInfo({
        roomCode: response.roomCode,
        jobTitle: response.jobTitle,
        companyName: response.companyName,
        instructions: response.instructions,
        maxDuration: response.maxDuration,
        status: "IN_PROGRESS",
        interviewType: "TECHNICAL",
      });

      setJoinResponse(response);
      setCandidateJoined(true);
      setInterviewStatus("ready");
    } catch (err) {
      console.error("Error creating and joining interview:", err);
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

    console.log("=== BACKEND RESPONSE DEBUG ===");
    console.log("Full joinResponse:", joinResponse);
    console.log("Room Name:", joinResponse.roomName);
    console.log("Server URL (old format):", joinResponse.serverUrl);
    console.log("WS URL (new format):", joinResponse.wsUrl);
    console.log(
      "Final server URL:",
      joinResponse.wsUrl || joinResponse.serverUrl
    );
    console.log("Identity:", joinResponse.identity);
    console.log("Participant Token:", joinResponse.participantToken);
    console.log("Token:", joinResponse.token);
    console.log(
      "Final token:",
      joinResponse.participantToken || joinResponse.token
    );
    console.log(
      "Token === ParticipantToken:",
      joinResponse.token === joinResponse.participantToken
    );
    console.log("===============================");

    setInterviewStatus("connecting");
    try {
      // Add event listeners before connecting
      console.log("Setting up room event listeners...");

      room.on("participantConnected", (participant) => {
        console.log(
          "🔗 Participant connected:",
          participant.identity,
          participant.name
        );
        console.log("Participant metadata:", participant.metadata);
        if (participant.metadata) {
          try {
            const parsedMetadata = JSON.parse(participant.metadata);
            console.log("Parsed participant metadata:", parsedMetadata);
          } catch (e) {
            console.log(
              "Participant metadata (raw string):",
              participant.metadata
            );
          }
        }
        console.log("Is agent:", participant.isAgent);

        // Check if this is an AI agent
        if (participant.isAgent) {
          console.log("✅ AI Agent joined the room!");
          setInterviewStatus("active");
        }
      });

      room.on("participantDisconnected", (participant) => {
        console.log("🚪 Participant disconnected:", participant.identity);
      });

      room.on("roomMetadataChanged", (metadata) => {
        console.log("📝 Room metadata changed:", metadata);
        try {
          const parsedMetadata = JSON.parse(metadata || "{}");
          console.log("📝 Parsed room metadata:", parsedMetadata);
        } catch (e) {
          console.log("📝 Room metadata (raw string):", metadata);
        }
      });

      room.on("participantMetadataChanged", (metadata, participant) => {
        console.log(
          "👤 Participant metadata changed:",
          participant?.identity,
          metadata
        );
        try {
          const parsedMetadata = JSON.parse(metadata || "{}");
          console.log("👤 Parsed participant metadata:", parsedMetadata);
        } catch (e) {
          console.log("👤 Participant metadata (raw string):", metadata);
        }
      });

      room.on("disconnected", (reason) => {
        console.log("❌ Room disconnected:", reason);
      });

      // Connect to the room
      console.log("Connecting to LiveKit room...");

      // Handle both old and new response formats
      const serverUrl = joinResponse.wsUrl || joinResponse.serverUrl;
      const token = joinResponse.participantToken || joinResponse.token;

      console.log("Using server:", serverUrl);
      console.log("Using room:", joinResponse.roomName);
      console.log("Using identity:", joinResponse.identity);
      console.log(
        "Using token type:",
        joinResponse.participantToken ? "participantToken" : "token"
      );

      await room.connect(serverUrl, token);

      console.log("✅ Successfully connected to room!");
      console.log("Room name:", room.name);
      console.log("Room state:", room.state);
      console.log("My participant identity:", room.localParticipant.identity);
      console.log("My participant name:", room.localParticipant.name);
      console.log("My participant metadata:", room.localParticipant.metadata);

      // Log initial room metadata
      console.log("=== INITIAL ROOM METADATA ===");
      console.log("Room metadata:", room.metadata);
      if (room.metadata) {
        try {
          const parsedRoomMetadata = JSON.parse(room.metadata);
          console.log("Parsed room metadata:", parsedRoomMetadata);
        } catch (e) {
          console.log("Room metadata (raw string):", room.metadata);
        }
      } else {
        console.log("No initial room metadata found");
      }
      console.log("============================");

      // Log all current participants
      console.log("=== CURRENT ROOM PARTICIPANTS ===");
      console.log("Total participants:", room.numParticipants);
      room.remoteParticipants.forEach((participant, key) => {
        console.log(`Participant ${key}:`, {
          identity: participant.identity,
          name: participant.name,
          metadata: participant.metadata,
          isAgent: participant.isAgent,
          isSpeaking: participant.isSpeaking,
          connectionQuality: participant.connectionQuality,
        });

        // Parse and log metadata if it exists
        if (participant.metadata) {
          try {
            const parsedMetadata = JSON.parse(participant.metadata);
            console.log(`Participant ${key} parsed metadata:`, parsedMetadata);
          } catch (e) {
            console.log(
              `Participant ${key} metadata (raw):`,
              participant.metadata
            );
          }
        }
      });
      console.log("================================");

      // Enable microphone
      console.log("Enabling microphone...");
      await room.localParticipant.setMicrophoneEnabled(true);
      console.log("Microphone enabled");

      setIsCallActive(true);
      setInterviewStatus("waiting");

      // Check for AI agent after a brief delay
      setTimeout(() => {
        const agentParticipants = Array.from(
          room.remoteParticipants.values()
        ).filter((p) => p.isAgent);
        console.log("AI Agent participants found:", agentParticipants.length);
        agentParticipants.forEach((agent) => {
          console.log("Agent details:", {
            identity: agent.identity,
            name: agent.name,
            metadata: agent.metadata,
          });
        });

        if (agentParticipants.length > 0) {
          console.log("✅ AI Agent found - interview ready!");
          setInterviewStatus("active");
        } else {
          console.log("⚠️ No AI Agent found yet - still waiting...");
          console.log(
            "Expected room name from backend:",
            joinResponse.roomName
          );
          console.log("Actual connected room name:", room.name);
          console.log("Room names match:", joinResponse.roomName === room.name);
        }
      }, 3000);
    } catch (err) {
      console.error("Connection error:", err);
      setError(
        `Failed to connect to interview: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setInterviewStatus("ready");
    }
  };

  const endInterview = async () => {
    if (!jobId || !joinResponse) return;

    try {
      // Disconnect from the room first
      if (room.state === "connected") {
        room.disconnect();
      }

      // Notify backend
      await publicInterviewService.endInterview(jobId, {
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
  if (interviewStatus === "error" || ((!phoneNumber || !jobId) && !loading)) {
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
  if (interviewStatus === "join_form" && !candidateJoined) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-xl p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Join Interview</h1>
            {roomInfo && (
              <div className="space-y-1 text-gray-300">
                <p className="font-medium">{roomInfo.jobTitle}</p>
                <p className="text-sm">{roomInfo.companyName}</p>
                <p className="text-xs text-gray-400">
                  {roomInfo.interviewType} • ~
                  {Math.floor(roomInfo.maxDuration / 60)} minutes
                </p>
              </div>
            )}
            {!roomInfo && (
              <div className="space-y-1 text-gray-300">
                <p className="text-sm">
                  Please enter your details to join the interview
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleJoinInterview} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={candidateDetails.phoneNumber}
                readOnly
                className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-gray-300 cursor-not-allowed"
                placeholder="e.g., +971501234567"
              />
              <p className="text-xs text-gray-400 mt-1">
                Your phone number from the invitation link
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors font-semibold"
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
