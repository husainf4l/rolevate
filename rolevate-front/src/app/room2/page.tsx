"use client";

import "@livekit/components-styles";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Room, Track } from "livekit-client";
import {
  RoomContext,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  useLocalParticipant,
  useRemoteParticipants,
  VideoTrack,
} from "@livekit/components-react";
import {
  SpeakerWaveIcon,
  PhoneXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Custom CSS for enhanced animations
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(19, 234, 217, 0.3); }
    50% { box-shadow: 0 0 40px rgba(19, 234, 217, 0.6), 0 0 60px rgba(8, 145, 178, 0.3); }
  }
  
  @keyframes ripple {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
  
  .interview-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .interview-glow {
    animation: glow 2s ease-in-out infinite;
  }
  
  .interview-ripple {
    animation: ripple 1.5s ease-out infinite;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = customStyles;
  if (!document.head.querySelector("[data-room2-styles]")) {
    styleElement.setAttribute("data-room2-styles", "true");
    document.head.appendChild(styleElement);
  }
}

// Enhanced Video Display Component
function VideoDisplay() {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  const agentParticipant = remoteParticipants.find(
    (p) =>
      p.identity.toLowerCase().includes("agent") ||
      p.identity.toLowerCase().includes("assistant")
  );

  // Get video tracks using Track.Source enum
  const localVideoTrack = localParticipant.getTrackPublication(
    Track.Source.Camera
  )?.track;
  const agentVideoTrack = agentParticipant?.getTrackPublication(
    Track.Source.Camera
  )?.track;

  return (
    <div className="flex gap-6 mb-8 justify-center">
      {/* User Video */}
      <div className="relative">
        <div className="w-40 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border-2 border-blue-300/50 shadow-lg">
          {localVideoTrack ? (
            <VideoTrack
              trackRef={{
                publication: localParticipant.getTrackPublication(
                  Track.Source.Camera
                )!,
                source: Track.Source.Camera,
                participant: localParticipant,
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <VideoCameraSlashIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-blue-700 text-sm font-medium">You</div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          You
        </div>
      </div>

      {/* Agent Video or Animation */}
      <div className="relative">
        <div className="w-40 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border-2 border-purple-300/50 shadow-lg">
          {agentVideoTrack && agentParticipant ? (
            <VideoTrack
              trackRef={{
                publication: agentParticipant.getTrackPublication(
                  Track.Source.Camera
                )!,
                source: Track.Source.Camera,
                participant: agentParticipant,
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
              {/* Enhanced AI Animation */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center shadow-lg interview-glow">
                  <span className="text-lg font-bold text-white">AI</span>
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-[#13ead9]/30 to-[#0891b2]/30 rounded-full animate-ping"></div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          AI Agent
        </div>
      </div>
    </div>
  );
}

// Enhanced Voice Assistant Component
function SimpleVoiceAssistant() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/30 overflow-hidden">
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#13ead9]/20 via-transparent to-[#0891b2]/20 p-[1px]">
        <div className="w-full h-full bg-white/80 backdrop-blur-2xl rounded-[2rem]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-12 text-center">
        <div className="mb-8">
          {/* Enhanced AI Avatar */}
          <div className="relative w-40 h-40 mx-auto mb-6 interview-float">
            {/* Outer Ring */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#13ead9]/30 to-[#0891b2]/30 rounded-full animate-pulse"></div>

            {/* Middle Ring */}
            <div className="absolute inset-2 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-full"></div>

            {/* AI Avatar */}
            <div className="absolute inset-4 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center shadow-2xl interview-glow">
              <span className="text-3xl font-bold text-white font-display">
                AI
              </span>
            </div>

            {/* Speaking indicator */}
            {audioTrack && (
              <div className="absolute -bottom-2 -right-2">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <SpeakerWaveIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 w-12 h-12 bg-green-400 rounded-full interview-ripple"></div>
              </div>
            )}

            {/* Connection Pulse Effect */}
            <div className="absolute inset-0 rounded-full border-2 border-[#13ead9]/50 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-2 border-[#0891b2]/30 animate-ping delay-300"></div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3 font-display tracking-tight">
            AI Voice Assistant
          </h2>
          <p className="text-lg text-gray-600 font-text leading-relaxed max-w-md mx-auto mb-4">
            Ready to begin your personalized interview experience
          </p>

          {/* State Display */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-white rounded-full border border-gray-200/50 shadow-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                state === "listening"
                  ? "bg-green-500 animate-pulse"
                  : state === "thinking"
                  ? "bg-yellow-500 animate-pulse"
                  : state === "speaking"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-gray-400"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-700 capitalize">
              {state}
            </span>
          </div>
        </div>

        {/* Video Display */}
        <div className="flex justify-center mb-8">
          <VideoDisplay />
        </div>

        {/* Enhanced Audio Visualizer */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl"></div>
            <div className="w-full max-w-lg mx-auto h-20 flex items-center justify-center p-4 bg-gradient-to-r from-[#13ead9]/5 via-transparent to-[#0891b2]/5 rounded-2xl">
              {audioTrack ? (
                <div className="relative w-full h-full">
                  <BarVisualizer
                    state={state}
                    barCount={12}
                    trackRef={audioTrack}
                    className="w-full h-full"
                    options={{
                      minHeight: 8,
                      maxHeight: 64,
                    }}
                  />
                  {/* Overlay gradient for enhanced visual effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#13ead9]/10 via-transparent to-[#0891b2]/10 rounded-xl pointer-events-none"></div>
                </div>
              ) : (
                <div className="flex gap-2 items-end">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="relative">
                      <div
                        className="w-3 bg-gradient-to-t from-[#13ead9] via-[#0891b2] to-[#13ead9] rounded-full animate-pulse shadow-lg"
                        style={{
                          height: Math.random() * 40 + 12,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: `${1.5 + Math.random()}s`,
                        }}
                      />
                      <div
                        className="absolute inset-0 w-3 bg-gradient-to-t from-[#13ead9]/50 via-[#0891b2]/50 to-[#13ead9]/50 rounded-full animate-pulse blur-sm"
                        style={{
                          height: Math.random() * 40 + 12,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: `${1.5 + Math.random()}s`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Room2Page() {
  const searchParams = useSearchParams();
  const [room] = useState(() => new Room());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Get parameters - support both direct LiveKit params and backend API params
  const directToken = searchParams.get("token");
  const directRoomName = searchParams.get("roomName");
  const directServerUrl = searchParams.get("serverUrl");

  // Backend API params
  const phone = searchParams.get("phone");
  const jobId = searchParams.get("jobId");
  const backendRoomName = searchParams.get("roomName");

  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Update call duration
  useEffect(() => {
    if (!isConnected) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isConnected]);

  const handleStartInterview = async () => {
    try {
      // Request both microphone and camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach((track) => track.stop());

      setNeedsPermission(false);
      console.log("🎤📹 Microphone and camera permissions granted");
    } catch (err) {
      console.error("❌ Microphone/camera permission denied:", err);
      setError(
        "Microphone and camera permissions are required for the voice interview."
      );
    }
  };

  useEffect(() => {
    // Only connect after permission is granted
    if (needsPermission) return;

    const connectToRoom = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        let token = directToken;
        let roomName = directRoomName;
        let serverUrl =
          directServerUrl || "wss://rolvate2-ckmk80qb.livekit.cloud";

        // If direct params are missing but backend params are available, create and join room
        if (!token && phone && jobId && backendRoomName) {
          console.log("🔌 Creating and joining new room via backend...");

          // First, create a new room
          const createResponse = await fetch(
            "http://localhost:4005/api/room/create-new-room",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jobId: jobId,
                phone: phone,
                roomName: backendRoomName,
              }),
            }
          );

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Failed to create room: ${errorText}`);
          }

          const createData = await createResponse.json();
          console.log("✅ Room created successfully:", createData);

          token = createData.token;
          roomName = createData.newRoom?.name || createData.roomName;
          serverUrl = createData.liveKitUrl;

          console.log("✅ Got room data from backend:", {
            roomName,
            serverUrl,
            token: token ? `${token.substring(0, 20)}...` : "No token",
          });
        }

        if (!token || !roomName) {
          throw new Error("Missing token or roomName parameters");
        }

        console.log("🚀 Connecting to LiveKit room:", { roomName, serverUrl });

        // Clear any existing event listeners
        room.removeAllListeners();

        // Set up event listeners
        room.on("connected", () => {
          console.log("✅ Connected to room");
          setIsConnected(true);
          setIsConnecting(false);
        });

        room.on("disconnected", (reason) => {
          console.log("❌ Disconnected from room, reason:", reason);
          setIsConnected(false);
          setIsConnecting(false);
        });

        room.on("reconnecting", () => {
          console.log("🔄 Reconnecting...");
          setIsConnecting(true);
        });

        room.on("reconnected", () => {
          console.log("✅ Reconnected");
          setIsConnected(true);
          setIsConnecting(false);
        });

        // Add more debugging event listeners
        room.on("participantConnected", (participant) => {
          console.log("👤 Participant connected:", participant.identity);
        });

        room.on("participantDisconnected", (participant) => {
          console.log("👤 Participant disconnected:", participant.identity);
        });

        room.on("connectionQualityChanged", (quality, participant) => {
          console.log(
            "📊 Connection quality:",
            quality,
            participant?.identity || "local"
          );
        });

        // Initialize audio context before connecting
        try {
          const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          if (audioContext.state === "suspended") {
            await audioContext.resume();
            console.log("🔊 Audio context resumed");
          }
        } catch (err) {
          console.warn("⚠️ Audio context initialization failed:", err);
        }

        // Connect to the room with audio enabled
        await room.connect(serverUrl, token, {
          autoSubscribe: true,
          // Add connection stability options
          rtcConfig: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          },
        });

        console.log("🎯 Connection completed");

        // Enable microphone and camera after connecting
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          console.log("🎤 Microphone enabled");

          await room.localParticipant.setCameraEnabled(true);
          console.log("📹 Camera enabled");
        } catch (err) {
          console.warn("⚠️ Failed to enable microphone/camera:", err);
        }
      } catch (err: any) {
        console.error("💥 Connection failed:", err);
        setError(err.message || "Failed to connect to room");
        setIsConnecting(false);
      }
    };

    connectToRoom();

    // Prevent disconnection on page unload to keep agent session alive
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Don't disconnect automatically
      console.log("🚪 Page unloading, but keeping room connection alive");
      e.preventDefault();
      return "Are you sure you want to leave? This will end the interview.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Don't disconnect on cleanup to prevent agent session from closing
    return () => {
      console.log("🧹 Component unmounting, keeping room connection alive");
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Don't disconnect here - let the user explicitly disconnect
      // if (room.state === "connected") {
      //   room.disconnect();
      // }
    };
  }, [
    needsPermission,
    directToken,
    directRoomName,
    directServerUrl,
    phone,
    jobId,
    backendRoomName,
  ]);

  const handleDisconnect = () => {
    if (room.state === "connected") {
      room.disconnect();
    }
  };

  if (needsPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] z-[2]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-full blur-3xl animate-pulse z-[2]"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-[#13ead9]/10 rounded-full blur-2xl animate-pulse delay-1000 z-[2]"></div>

        <div className="relative z-10 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/30 p-12 max-w-md w-full">
          <div className="text-center">
            <div className="relative w-20 h-20 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg interview-glow">
              <VideoCameraIcon className="w-10 h-10 text-white" />
              <div className="absolute inset-0 rounded-2xl border-2 border-[#13ead9]/50 animate-ping"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 font-display tracking-tight">
              Voice Interview Setup
            </h2>
            <p className="text-gray-600 mb-8 font-text leading-relaxed">
              We need access to your microphone and camera to conduct the voice
              interview with our AI assistant.
            </p>
            <button
              onClick={handleStartInterview}
              className="w-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] hover:from-[#0891b2] hover:to-[#13ead9] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] z-[2]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative z-10 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/30 p-12 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 font-display tracking-tight">
              Connection Error
            </h2>
            <p className="text-gray-600 mb-6 font-text leading-relaxed">
              {error}
            </p>

            <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-50/80 rounded-xl">
              <p className="font-medium mb-2">This page requires either:</p>
              <div className="text-left space-y-1">
                <p>
                  • Direct params:{" "}
                  <code className="bg-gray-200 px-1 rounded text-xs">
                    token
                  </code>
                  ,{" "}
                  <code className="bg-gray-200 px-1 rounded text-xs">
                    roomName
                  </code>
                  ,{" "}
                  <code className="bg-gray-200 px-1 rounded text-xs">
                    serverUrl
                  </code>
                </p>
                <p>
                  • Backend params:{" "}
                  <code className="bg-gray-200 px-1 rounded text-xs">
                    phone
                  </code>
                  ,{" "}
                  <code className="bg-gray-200 px-1 rounded text-xs">
                    jobId
                  </code>
                  ,{" "}
                  <code className="bg-gray-200 px-1 rounded text-xs">
                    roomName
                  </code>
                </p>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] hover:from-[#0891b2] hover:to-[#13ead9] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] z-[2]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-full blur-3xl animate-pulse z-[2]"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-[#13ead9]/10 rounded-full blur-2xl animate-pulse delay-1000 z-[2]"></div>

        <div className="relative z-10 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-[#13ead9] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-[#0891b2]/30 border-b-transparent rounded-full animate-spin delay-150 mx-auto"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 font-display tracking-tight">
            Creating New Room...
          </h2>
          <p className="text-lg text-gray-600 font-text">
            Setting up fresh interview session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] z-[2]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#13ead9]/10 to-[#0891b2]/10 rounded-full blur-3xl animate-pulse z-[2]"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-[#13ead9]/10 rounded-full blur-2xl animate-pulse delay-1000 z-[2]"></div>

        {/* Header */}
        <div className="relative z-10 bg-white/95 backdrop-blur-2xl border-b border-gray-200/30 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center shadow-lg">
                    <VideoCameraIcon className="w-6 h-6 text-white" />
                  </div>
                  {isConnected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 font-display tracking-tight">
                    Room 2 - Enhanced Voice Assistant
                  </h1>
                  <p className="text-sm text-gray-600 font-text">
                    AI Interview Experience
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Connection Status */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50/80 rounded-full border border-gray-200/50">
                  <div className="relative">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {isConnected && (
                      <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium font-text ${
                      isConnected ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                {/* Call Duration */}
                {isConnected && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-white rounded-full border border-gray-200/50 shadow-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-gray-800 font-mono tracking-wider">
                      {formatDuration(callDuration)}
                    </span>
                  </div>
                )}

                {/* Disconnect Button */}
                <button
                  onClick={handleDisconnect}
                  className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-red-200 transform hover:scale-105 active:scale-95"
                  title="Leave interview"
                >
                  <PhoneXMarkIcon className="w-6 h-6" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-5xl">
            {isConnected ? (
              <SimpleVoiceAssistant />
            ) : (
              <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/30 p-12 text-center">
                <div className="relative w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <VideoCameraSlashIcon className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-display tracking-tight">
                  Waiting for Connection
                </h3>
                <p className="text-gray-600 font-text leading-relaxed">
                  Voice assistant will appear once connected to the room.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Audio Renderer */}
        <div
          id="audio-container"
          className="fixed top-0 left-0 w-0 h-0 overflow-visible"
        >
          <RoomAudioRenderer volume={1.0} muted={false} />
        </div>
      </div>
    </RoomContext.Provider>
  );
}
