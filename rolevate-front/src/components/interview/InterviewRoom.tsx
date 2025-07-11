"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Room, RoomEvent, RemoteParticipant } from "livekit-client";
import {
  RoomContext,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
} from "@livekit/components-react";
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  PhoneXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import ParticleBackground from "./ParticleBackground";

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
  if (!document.head.querySelector("[data-interview-styles]")) {
    styleElement.setAttribute("data-interview-styles", "true");
    document.head.appendChild(styleElement);
  }
}

interface InterviewRoomProps {
  roomName: string;
  token: string;
  serverUrl: string;
  onLeave?: () => void;
  candidateName?: string;
  jobTitle?: string;
  companyName?: string;
}

interface MediaDeviceState {
  microphone: boolean;
  camera: boolean;
  speaker: boolean;
  screenShare: boolean;
}

export default function InterviewRoom({
  roomName,
  token,
  serverUrl,
  onLeave,
  jobTitle = "Interview",
  companyName = "Company",
}: InterviewRoomProps) {
  const [room] = useState(() => new Room());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [aiAgent, setAiAgent] = useState<RemoteParticipant | null>(null);

  // Media device states
  const [mediaDevices, setMediaDevices] = useState<MediaDeviceState>({
    microphone: true,
    camera: false, // Start with camera off for audio-only interview
    speaker: true,
    screenShare: false,
  });

  // Timer for call duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

  // Format duration to MM:SS
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Connect to LiveKit room
  const connectToRoom = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log("Connecting to LiveKit room:", { roomName, serverUrl });

      // Set up room event listeners
      room.on(RoomEvent.Connected, () => {
        console.log("✅ Connected to room");
        setIsConnected(true);
        setIsConnecting(false);
      });

      room.on(RoomEvent.Disconnected, (reason) => {
        console.log("❌ Disconnected from room:", reason);
        setIsConnected(false);
        setIsConnecting(false);
      });

      room.on(
        RoomEvent.ParticipantConnected,
        (participant: RemoteParticipant) => {
          console.log("👤 Participant connected:", participant.identity);

          // Check if this is an AI agent
          if (
            participant.isAgent ||
            participant.identity.includes("agent") ||
            participant.identity.includes("ai")
          ) {
            console.log("🤖 AI Agent detected");
            setAiAgent(participant);
          }
        }
      );

      room.on(
        RoomEvent.ParticipantDisconnected,
        (participant: RemoteParticipant) => {
          console.log("👤 Participant disconnected:", participant.identity);

          if (participant === aiAgent) {
            setAiAgent(null);
          }
        }
      );

      room.on(RoomEvent.MediaDevicesError, (error: Error) => {
        console.error("Media devices error:", error);
        setError(
          "Failed to access camera/microphone. Please check permissions."
        );
      });

      // Connect to the room
      await room.connect(serverUrl, token);

      // Enable microphone by default
      await room.localParticipant.setMicrophoneEnabled(mediaDevices.microphone);
    } catch (err) {
      console.error("Failed to connect to room:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to interview room"
      );
      setIsConnecting(false);
    }
  }, [room, roomName, serverUrl, token, mediaDevices.microphone, aiAgent]);

  // Media control functions
  const toggleMicrophone = useCallback(async () => {
    try {
      const enabled = !mediaDevices.microphone;
      await room.localParticipant.setMicrophoneEnabled(enabled);
      setMediaDevices((prev) => ({ ...prev, microphone: enabled }));
    } catch (err) {
      console.error("Failed to toggle microphone:", err);
    }
  }, [room, mediaDevices.microphone]);

  const toggleCamera = useCallback(async () => {
    try {
      const enabled = !mediaDevices.camera;
      await room.localParticipant.setCameraEnabled(enabled);
      setMediaDevices((prev) => ({ ...prev, camera: enabled }));
    } catch (err) {
      console.error("Failed to toggle camera:", err);
    }
  }, [room, mediaDevices.camera]);

  const toggleScreenShare = useCallback(async () => {
    try {
      const enabled = !mediaDevices.screenShare;
      await room.localParticipant.setScreenShareEnabled(enabled);
      setMediaDevices((prev) => ({ ...prev, screenShare: enabled }));
    } catch (err) {
      console.error("Failed to toggle screen share:", err);
      setError("Failed to start screen sharing. Please try again.");
    }
  }, [room, mediaDevices.screenShare]);

  const leaveRoom = useCallback(async () => {
    try {
      if (room.state === "connected") {
        room.disconnect();
      }
      onLeave?.();
    } catch (err) {
      console.error("Error leaving room:", err);
      onLeave?.();
    }
  }, [room, onLeave]);

  // Connect when component mounts
  useEffect(() => {
    connectToRoom();

    return () => {
      if (room.state === "connected") {
        room.disconnect();
      }
    };
  }, [connectToRoom, room]);

  // Connection status indicator
  const getConnectionStatus = () => {
    if (isConnecting)
      return { text: "Connecting...", color: "text-yellow-500" };
    if (!isConnected) return { text: "Disconnected", color: "text-red-500" };
    if (aiAgent) return { text: "Interview Active", color: "text-green-500" };
    return { text: "Waiting for Interviewer", color: "text-blue-500" };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <RoomContext.Provider value={room}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col relative overflow-hidden">
        {/* Particle Background */}
        <ParticleBackground />

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
                    {jobTitle}
                  </h1>
                  <p className="text-sm text-gray-600 font-text">
                    {companyName}
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
                    className={`text-sm font-medium ${connectionStatus.color} font-text`}
                  >
                    {connectionStatus.text}
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
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-5xl">
            {/* Error Display */}
            {error && (
              <div className="mb-8 p-5 bg-red-50/90 backdrop-blur-xl border border-red-200/50 rounded-3xl flex items-center gap-4 shadow-lg animate-in slide-in-from-top duration-500">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 font-display">
                    Connection Error
                  </h3>
                  <p className="text-red-700 font-text text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Interview Interface */}
            <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/30 overflow-hidden">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#13ead9]/20 via-transparent to-[#0891b2]/20 p-[1px]">
                <div className="w-full h-full bg-white/80 backdrop-blur-2xl rounded-[2rem]"></div>
              </div>

              {/* AI Interviewer Section */}
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

                    {/* Enhanced Speaking indicator */}
                    {aiAgent && (
                      <div className="absolute -bottom-2 -right-2">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <SpeakerWaveIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute inset-0 w-12 h-12 bg-green-400 rounded-full interview-ripple"></div>
                      </div>
                    )}

                    {/* Connection Pulse Effect */}
                    {isConnected && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-[#13ead9]/50 animate-ping"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-[#0891b2]/30 animate-ping delay-300"></div>
                      </>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-3 font-display tracking-tight">
                    AI Interviewer
                  </h2>
                  <p className="text-lg text-gray-600 font-text leading-relaxed max-w-md mx-auto">
                    Ready to begin your personalized technical interview
                    experience
                  </p>
                </div>

                {/* Enhanced Audio Visualizer */}
                {isConnected && aiAgent && (
                  <div className="mb-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl"></div>
                      <AudioVisualizer />
                    </div>
                  </div>
                )}

                {/* Enhanced Status Messages */}
                {isConnecting && (
                  <div className="mb-8 p-6 bg-blue-50/90 backdrop-blur-xl rounded-2xl border border-blue-200/50 animate-pulse">
                    <div className="flex items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-6 h-6 border-3 border-blue-300 border-b-transparent rounded-full animate-spin delay-150"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-800 font-semibold font-display">
                          Establishing Connection
                        </div>
                        <div className="text-blue-600 text-sm font-text">
                          Connecting to interview room...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isConnected && !aiAgent && (
                  <div className="mb-8 p-6 bg-amber-50/90 backdrop-blur-xl rounded-2xl border border-amber-200/50">
                    <div className="flex items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-6 h-6 border-3 border-amber-300 border-b-transparent rounded-full animate-spin delay-300"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-amber-800 font-semibold font-display">
                          Preparing Interview
                        </div>
                        <div className="text-amber-600 text-sm font-text">
                          Waiting for AI interviewer to join...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isConnected && aiAgent && (
                  <div className="mb-8 p-6 bg-green-50/90 backdrop-blur-xl rounded-2xl border border-green-200/50">
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <div className="text-green-800 font-semibold font-display">
                          Interview Live
                        </div>
                        <div className="text-green-600 text-sm font-text">
                          AI interviewer is ready to begin
                          {mediaDevices.screenShare &&
                            " • Screen sharing active"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Screen Share Status */}
                {mediaDevices.screenShare && (
                  <div className="mb-8 p-6 bg-blue-50/90 backdrop-blur-xl rounded-2xl border border-blue-200/50">
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <ComputerDesktopIcon className="w-3 h-3 text-white" />
                      </div>
                      <div className="text-center">
                        <div className="text-blue-800 font-semibold font-display">
                          Screen Sharing Active
                        </div>
                        <div className="text-blue-600 text-sm font-text">
                          Your screen is being shared with the interviewer
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="mt-10 flex justify-center">
              <div className="relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#13ead9]/20 via-white/40 to-[#0891b2]/20 rounded-3xl blur-xl"></div>

                {/* Controls Container */}
                <div className="relative flex items-center gap-6 p-6 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40">
                  {/* Microphone Control */}
                  <div className="relative group">
                    <button
                      onClick={toggleMicrophone}
                      className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 ${
                        mediaDevices.microphone
                          ? "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200"
                          : "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200"
                      }`}
                      title={
                        mediaDevices.microphone
                          ? "Mute microphone"
                          : "Unmute microphone"
                      }
                    >
                      <MicrophoneIcon
                        className={`w-7 h-7 transition-all duration-200 ${
                          !mediaDevices.microphone && "animate-pulse"
                        }`}
                      />
                      {!mediaDevices.microphone && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-red-300 animate-pulse"></div>
                      )}
                    </button>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1 whitespace-nowrap">
                        {mediaDevices.microphone ? "Mute" : "Unmute"}
                      </div>
                    </div>
                  </div>

                  {/* Camera Control */}
                  <div className="relative group">
                    <button
                      onClick={toggleCamera}
                      className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 ${
                        mediaDevices.camera
                          ? "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200"
                          : "bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-600"
                      }`}
                      title={
                        mediaDevices.camera
                          ? "Turn off camera"
                          : "Turn on camera"
                      }
                    >
                      {mediaDevices.camera ? (
                        <VideoCameraIcon className="w-7 h-7" />
                      ) : (
                        <VideoCameraSlashIcon className="w-7 h-7" />
                      )}
                    </button>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1 whitespace-nowrap">
                        {mediaDevices.camera
                          ? "Turn off camera"
                          : "Turn on camera"}
                      </div>
                    </div>
                  </div>

                  {/* Screen Share Control */}
                  <div className="relative group">
                    <button
                      onClick={toggleScreenShare}
                      className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95 ${
                        mediaDevices.screenShare
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-200"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border border-gray-200"
                      }`}
                      title={
                        mediaDevices.screenShare
                          ? "Stop screen sharing"
                          : "Start screen sharing"
                      }
                    >
                      <ComputerDesktopIcon
                        className={`w-7 h-7 transition-all duration-200 ${
                          mediaDevices.screenShare && "animate-pulse"
                        }`}
                      />
                      {mediaDevices.screenShare && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-blue-300 animate-pulse"></div>
                      )}
                    </button>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1 whitespace-nowrap">
                        {mediaDevices.screenShare
                          ? "Stop sharing"
                          : "Share screen"}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                  {/* Leave Call */}
                  <div className="relative group">
                    <button
                      onClick={leaveRoom}
                      className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-red-200 transform hover:scale-105 active:scale-95"
                      title="Leave interview"
                    >
                      <PhoneXMarkIcon className="w-7 h-7" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                    </button>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-1 whitespace-nowrap">
                        Leave interview
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Renderer */}
        <RoomAudioRenderer />
      </div>
    </RoomContext.Provider>
  );
}

// Enhanced Audio Visualizer Component
function AudioVisualizer() {
  const { state: agentState, audioTrack } = useVoiceAssistant();

  if (!audioTrack) {
    return (
      <div className="w-full max-w-lg mx-auto h-20 flex items-center justify-center p-4">
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
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto h-20 flex items-center justify-center p-4 bg-gradient-to-r from-[#13ead9]/5 via-transparent to-[#0891b2]/5 rounded-2xl">
      <div className="relative w-full h-full">
        <BarVisualizer
          state={agentState}
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
    </div>
  );
}
