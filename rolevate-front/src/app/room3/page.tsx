"use client";

import "@livekit/components-styles";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Room, Track, TranscriptionSegment } from "livekit-client";
import {
  RoomContext,
  RoomAudioRenderer,
  useVoiceAssistant,
  useLocalParticipant,
  VideoTrack,
  useRoomContext,
} from "@livekit/components-react";
import {
  CpuChipIcon,
  PhoneXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MicrophoneIcon,
  XMarkIcon,
  ComputerDesktopIcon,
  TrophyIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import ParticleBackground from "@/components/interview/ParticleBackground";

const customStyles = `
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(19, 234, 217, 0.3); }
    50% { box-shadow: 0 0 40px rgba(19, 234, 217, 0.6), 0 0 60px rgba(8, 145, 178, 0.3); }
  }
  
  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes scale-in {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes caption-slide-up {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .interview-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .interview-breathe { animation: breathe 4s ease-in-out infinite; }
  .interview-float { animation: float 6s ease-in-out infinite; }
  .interview-fade-in { animation: fade-in 0.6s ease-out; }
  .interview-scale-in { animation: scale-in 0.4s ease-out; }
  .caption-slide-up { animation: caption-slide-up 0.3s ease-out; }
  
  .fullscreen-container {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
    background: black !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  .fullscreen-video {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }
`;

if (typeof document !== "undefined") {
  if (!document.head.querySelector("[data-room3-styles]")) {
    const styleElement = document.createElement("style");
    styleElement.setAttribute("data-room3-styles", "true");
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
  }
}

function InterviewUI({
  jobInfo,
  companyInfo,
  participantName,
}: {
  jobInfo?: any;
  companyInfo?: any;
  participantName?: string;
}) {
  const { state } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(45).fill(0));
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [aiTranscript, setAiTranscript] = useState<string>("");
  const [showCaptions, setShowCaptions] = useState(true);
  const [isTranscriptFinal, setIsTranscriptFinal] = useState<boolean>(false);
  const [roomMetadata, setRoomMetadata] = useState<any>(null);

  useEffect(() => {
    const micPublication = localParticipant.getTrackPublication(
      Track.Source.Microphone
    );
    const cameraPublication = localParticipant.getTrackPublication(
      Track.Source.Camera
    );
    const screenPublication = localParticipant.getTrackPublication(
      Track.Source.ScreenShare
    );

    setIsMicEnabled(micPublication?.isEnabled ?? true);
    setIsCameraEnabled(cameraPublication?.isEnabled ?? true);
    setIsScreenSharing(screenPublication?.isEnabled ?? false);
  }, [localParticipant]);

  useEffect(() => {
    if (!isMicEnabled) {
      setAudioLevels(Array(45).fill(0));
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
        setAnalyser(null);
      }
      return;
    }

    const setupAudioAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyserNode = context.createAnalyser();

        analyserNode.fftSize = 128;
        source.connect(analyserNode);

        setAudioContext(context);
        setAnalyser(analyserNode);
        return undefined;
      } catch (error) {
        console.warn("Could not access microphone for audio analysis:", error);
        // Fallback to simulation
        const interval = setInterval(() => {
          const newLevels = Array.from(
            { length: 45 },
            () => Math.random() * 0.3
          );
          setAudioLevels(newLevels);
        }, 100);
        return () => clearInterval(interval);
      }
    };

    setupAudioAnalysis();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isMicEnabled]);

  useEffect(() => {
    if (!analyser || !isMicEnabled) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioLevels = () => {
      analyser.getByteFrequencyData(dataArray);

      const newLevels = Array.from({ length: 45 }, (_, i) => {
        const dataIndex = Math.floor((i / 45) * dataArray.length);
        const rawLevel = (dataArray[dataIndex] || 0) / 255;
        return Math.max(0.05, rawLevel);
      });

      setAudioLevels(newLevels);
      requestAnimationFrame(updateAudioLevels);
    };

    updateAudioLevels();
  }, [analyser, isMicEnabled]);

  // Listen for AI transcriptions
  useEffect(() => {
    if (!room) return;

    const handleTranscriptionReceived = (
      segments: TranscriptionSegment[],
      participant: any
    ) => {
      // Only show transcripts from AI (not from the local participant)
      if (participant && participant !== localParticipant) {
        // Combine all segments (both final and interim) for real-time streaming
        const streamingText = segments.map((segment) => segment.text).join(" ");

        if (streamingText.trim()) {
          setAiTranscript(streamingText);

          // Check if this is final or interim text
          const hasFinalSegment = segments.some((segment) => segment.final);
          setIsTranscriptFinal(hasFinalSegment);

          // Only set auto-hide timer for final segments
          if (hasFinalSegment) {
            setTimeout(() => {
              setAiTranscript("");
              setIsTranscriptFinal(false);
            }, 5000); // Reduced to 5 seconds for better flow
          }
        }
      }
    };

    room.on("transcriptionReceived", handleTranscriptionReceived);

    return () => {
      room.off("transcriptionReceived", handleTranscriptionReceived);
    };
  }, [room, localParticipant]);

  // Extract room metadata when room connects
  useEffect(() => {
    if (room && room.metadata) {
      try {
        const metadata = JSON.parse(room.metadata);
        setRoomMetadata(metadata);
      } catch (error) {
        console.log("No metadata or invalid JSON in room metadata");
      }
    }
  }, [room]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const localVideoTrack = localParticipant.getTrackPublication(
    Track.Source.Camera
  )?.track;

  const localScreenTrack = localParticipant.getTrackPublication(
    Track.Source.ScreenShare
  )?.track;

  const displayTrack = localScreenTrack || localVideoTrack;
  const displaySource = localScreenTrack
    ? Track.Source.ScreenShare
    : Track.Source.Camera;

  const statusInfo = {
    idle: {
      text: "Ready",
      color: "blue-500",
      bgColor: "bg-blue-500",
      message: "Interview session is ready",
    },
    listening: {
      text: "Listening",
      color: "green-500",
      bgColor: "bg-green-500",
      message: "Actively listening to your response",
    },
    thinking: {
      text: "Processing",
      color: "amber-500",
      bgColor: "bg-amber-500",
      message: "Analyzing your response",
    },
    speaking: {
      text: "Speaking",
      color: "purple-500",
      bgColor: "bg-purple-500",
      message: "AI interviewer is responding",
    },
    disconnected: {
      text: "Reconnecting",
      color: "gray-500",
      bgColor: "bg-gray-500",
      message: "Attempting to reconnect",
    },
  } as const;

  const currentStatus =
    statusInfo[state as keyof typeof statusInfo] || statusInfo.idle;

  const toggleFullscreen = useCallback(async () => {
    const videoContainer = document.querySelector(
      ".video-container"
    ) as HTMLElement;

    if (!document.fullscreenElement) {
      try {
        await videoContainer?.requestFullscreen();
        setIsVideoFullscreen(true);
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
        // Fallback to CSS fullscreen
        setIsVideoFullscreen(true);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsVideoFullscreen(false);
      } catch (err) {
        console.error("Failed to exit fullscreen:", err);
        setIsVideoFullscreen(false);
      }
    }
  }, []);

  const toggleMicrophone = useCallback(async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!isMicEnabled);
      setIsMicEnabled(!isMicEnabled);
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
    }
  }, [localParticipant, isMicEnabled]);

  const toggleCamera = useCallback(async () => {
    try {
      if (!isCameraEnabled) {
        await localParticipant.setCameraEnabled(true, {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        });
      } else {
        await localParticipant.setCameraEnabled(false);
      }
      setIsCameraEnabled(!isCameraEnabled);
    } catch (error) {
      console.error("Failed to toggle camera:", error);
    }
  }, [localParticipant, isCameraEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        // Enable screen share with high quality settings
        await localParticipant.setScreenShareEnabled(true, {
          resolution: {
            width: 2560,
            height: 1440,
            frameRate: 15,
          },
        });
      } else {
        // Disable screen share
        await localParticipant.setScreenShareEnabled(false);
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
    }
  }, [localParticipant, isScreenSharing]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVideoFullscreen) {
        setIsVideoFullscreen(false);
      }
    };

    const handleFullscreenChange = () => {
      setIsVideoFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isVideoFullscreen]);

  return (
    <div className="relative w-full max-w-7xl mx-auto interview-fade-in">
      {/* Enhanced Professional Header */}
      <div className="bg-gradient-to-r from-white/98 via-slate-50/95 to-white/98 backdrop-blur-xl rounded-t-3xl border-b border-slate-200/40 shadow-lg">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Brand & Interview Info */}
            <div className="flex items-center gap-6">
              <div className="relative interview-scale-in">
                <div className="w-16 h-16 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center shadow-2xl interview-breathe">
                  <CpuChipIcon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white animate-pulse shadow-lg"></div>
                {/* Professional pulse ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-[#13ead9]/30 animate-pulse"></div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {jobInfo?.title || roomMetadata?.jobTitle
                      ? `${jobInfo?.title || roomMetadata.jobTitle} Interview`
                      : "AI Interview Session"}
                  </h1>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                    LIVE INTERVIEW
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#13ead9] rounded-full animate-pulse"></span>
                    <span className="font-medium">Rolevate AI Platform</span>
                  </div>

                  {/* Company Information */}
                  {companyInfo?.name && (
                    <>
                      <div className="h-3 w-px bg-slate-300"></div>
                      <span className="text-slate-600 font-medium">
                        {companyInfo.name}
                      </span>
                    </>
                  )}

                  {/* Location */}
                  {jobInfo?.location && (
                    <>
                      <div className="h-3 w-px bg-slate-300"></div>
                      <span className="text-slate-500">{jobInfo.location}</span>
                    </>
                  )}

                  {/* Participant Name */}
                  {participantName && (
                    <>
                      <div className="h-3 w-px bg-slate-300"></div>
                      <span className="text-slate-600">
                        Candidate: {participantName}
                      </span>
                    </>
                  )}

                  {roomMetadata?.createdAt && (
                    <>
                      <div className="h-3 w-px bg-slate-300"></div>
                      <span className="text-slate-500">
                        Started{" "}
                        {new Date(roomMetadata.createdAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </>
                  )}

                  {roomMetadata?.recreated && (
                    <>
                      <div className="h-3 w-px bg-slate-300"></div>
                      <span className="text-orange-600 font-medium">
                        Reconnected Session
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section - Status & Controls */}
            <div className="flex items-center gap-4">
              {/* AI Status Indicator */}
              <div className="flex items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <div
                    className={`w-4 h-4 rounded-full ${currentStatus.bgColor} shadow-lg`}
                  ></div>
                  <div
                    className={`absolute inset-0 w-4 h-4 rounded-full ${currentStatus.bgColor} animate-ping opacity-75`}
                  ></div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-slate-700">
                    {currentStatus.text}
                  </div>
                  <div className="text-xs text-slate-500">AI Interviewer</div>
                </div>
              </div>

              {/* Session Timer */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg">
                <ClockIcon className="w-5 h-5 text-slate-500" />
                <div className="text-sm">
                  <div className="font-mono font-semibold text-slate-700">
                    {Math.floor(sessionDuration / 60)}:
                    {(sessionDuration % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-slate-500">Duration</div>
                </div>
              </div>

              {/* Interview Progress */}
              {(jobInfo?.title || roomMetadata?.jobTitle) && (
                <div className="hidden lg:flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg">
                  <TrophyIcon className="w-5 h-5 text-blue-600" />
                  <div className="text-sm">
                    <div className="font-semibold text-blue-700">
                      Interview Active
                    </div>
                    <div className="text-xs text-blue-600">
                      {jobInfo?.title || roomMetadata.jobTitle}
                    </div>
                    {companyInfo?.name && (
                      <div className="text-xs text-blue-500">
                        {companyInfo.name}
                      </div>
                    )}
                    {jobInfo?.experience && (
                      <div className="text-xs text-blue-400">
                        {jobInfo.experience} experience
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-white/95 backdrop-blur-xl rounded-b-3xl shadow-2xl border border-white/30">
        {/* Video Section */}
        <div className="lg:col-span-2">
          <div
            className={`video-container relative aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/50 group ${
              isVideoFullscreen ? "fullscreen-container" : ""
            }`}
          >
            {displayTrack && (isCameraEnabled || isScreenSharing) ? (
              <VideoTrack
                trackRef={{
                  publication:
                    localParticipant.getTrackPublication(displaySource)!,
                  source: displaySource,
                  participant: localParticipant,
                }}
                className={`w-full h-full ${
                  isVideoFullscreen ? "fullscreen-video" : "object-cover"
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 relative z-10">
                <div className="text-center text-slate-500 max-w-md px-6 relative z-20">
                  {!isCameraEnabled ? (
                    // Camera activation prompt
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg interview-breathe">
                        <VideoCameraIcon className="w-10 h-10 text-slate-500" />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-700">
                          Camera Not Active
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Enable your camera for better engagement and
                          communication during the interview.
                        </p>

                        <div className="bg-blue-50 border border-blue-200/50 rounded-xl p-3">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <TrophyIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                              +15 points bonus
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 text-center">
                            Better engagement score with video presence
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={toggleCamera}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer"
                      >
                        <VideoCameraIcon className="w-5 h-5" />
                        Enable Camera
                      </button>
                    </div>
                  ) : (
                    // Screen share disabled fallback
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg interview-breathe">
                        <ComputerDesktopIcon className="w-10 h-10 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">
                        Screen Share Disabled
                      </h3>
                      <p className="text-sm text-slate-500">
                        Click the screen share button to show your presentation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Streaming Captions Overlay */}
            {aiTranscript && showCaptions && (
              <div className="absolute bottom-16 left-4 right-4 z-40 pointer-events-none caption-slide-up">
                <div className="bg-black/85 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl border border-white/20 max-w-3xl mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">AI</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed font-medium text-white/95">
                        {aiTranscript}
                        {!isTranscriptFinal && (
                          <span className="inline-block w-0.5 h-4 bg-white/70 ml-1 animate-pulse rounded-sm"></span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCaptions(false)}
                      className="flex-shrink-0 w-5 h-5 text-white/70 hover:text-white/90 transition-colors pointer-events-auto"
                      title="Hide captions"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Controls Overlay - Only show when video is active */}
            {displayTrack && (isCameraEnabled || isScreenSharing) && (
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-300 z-30 ${
                  isVideoFullscreen
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Candidate</span>
                      {isScreenSharing && (
                        <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-blue-500/80 rounded-lg text-xs">
                          <ComputerDesktopIcon className="w-3 h-3" />
                          Screen
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMicrophone}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isMicEnabled
                          ? "bg-white/90 text-slate-700 hover:bg-white"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {isMicEnabled ? (
                        <MicrophoneIcon className="w-5 h-5" />
                      ) : (
                        <div className="relative">
                          <MicrophoneIcon className="w-5 h-5" />
                          <XMarkIcon className="w-3 h-3 absolute -top-0.5 -right-0.5 text-white" />
                        </div>
                      )}
                    </button>

                    <button
                      onClick={toggleCamera}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isCameraEnabled
                          ? "bg-white/90 text-slate-700 hover:bg-white"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {isCameraEnabled ? (
                        <VideoCameraIcon className="w-5 h-5" />
                      ) : (
                        <VideoCameraSlashIcon className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={toggleScreenShare}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isScreenSharing
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-white/90 text-slate-700 hover:bg-white"
                      }`}
                      title={
                        isScreenSharing ? "Stop sharing screen" : "Share screen"
                      }
                    >
                      <ComputerDesktopIcon className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setShowCaptions(!showCaptions)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        showCaptions
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-white/90 text-slate-700 hover:bg-white"
                      }`}
                      title={showCaptions ? "Hide captions" : "Show captions"}
                    >
                      <LanguageIcon className="w-5 h-5" />
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 bg-white/90 hover:bg-white text-slate-700 rounded-full flex items-center justify-center transition-all duration-200"
                    >
                      {isVideoFullscreen ? (
                        <ArrowsPointingInIcon className="w-5 h-5" />
                      ) : (
                        <ArrowsPointingOutIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quality Indicator */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-lg border border-white/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-4 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-2 bg-green-400 rounded-full"></div>
                    <div className="w-0.5 h-5 bg-green-500 rounded-full"></div>
                  </div>
                  {isScreenSharing ? "1440p" : "720p"}
                </div>
              </div>

              {/* Camera Bonus Reminder */}
              {!isCameraEnabled && (
                <div className="bg-blue-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg border border-blue-400/50">
                  <div className="flex items-center gap-1.5">
                    <TrophyIcon className="w-3 h-3" />
                    <span>+15 pts</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audio Visualization */}
          <div className="mt-6 bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border border-slate-200/50 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">
                Audio Analysis
              </h3>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                  isMicEnabled ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isMicEnabled ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-xs font-medium ${
                    isMicEnabled ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isMicEnabled ? "ACTIVE" : "MUTED"}
                </span>
              </div>
            </div>

            <div className="relative h-20 w-full bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/50 shadow-inner overflow-hidden">
              <div className="flex gap-1 items-end h-full w-full justify-center p-3">
                {audioLevels.map((level, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-100 ${
                      isMicEnabled && level > 0.1
                        ? "bg-gradient-to-t from-[#13ead9] to-[#0891b2]"
                        : "bg-gradient-to-t from-gray-300 to-gray-400"
                    }`}
                    style={{
                      height: `${Math.max(8, level * 70)}%`,
                      opacity: isMicEnabled ? 0.8 + level * 0.2 : 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Audio activity indicator */}
              {isMicEnabled && audioLevels.some((level) => level > 0.5) && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>

            <p className="text-center text-sm text-slate-600 mt-4">
              {currentStatus.message}
            </p>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border border-slate-200/50 shadow-lg text-center">
            <div className="relative w-28 h-28 mx-auto mb-6 interview-float">
              <div className="absolute inset-0 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center shadow-xl interview-pulse-glow">
                <span className="text-2xl font-bold text-white">AI</span>
              </div>

              {state === "speaking" && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-bounce">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}

              {state === "listening" && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">
              AI Interviewer
            </h3>
            <p className="text-slate-600 mb-4">{currentStatus.message}</p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
              <div
                className={`w-2 h-2 rounded-full ${currentStatus.bgColor} animate-pulse`}
              ></div>
              <span className="text-sm font-medium text-slate-700">
                {currentStatus.text}
              </span>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Session Information
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
                <span className="text-sm text-slate-600">Duration</span>
                <span className="text-sm font-mono font-semibold text-slate-800">
                  {Math.floor(sessionDuration / 60)}:
                  {(sessionDuration % 60).toString().padStart(2, "0")}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
                <span className="text-sm text-slate-600">Connection</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">
                    Secure
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 px-3 bg-white/70 rounded-lg">
                <span className="text-sm text-slate-600">Audio Quality</span>
                <span className="text-sm font-medium text-blue-700">
                  Excellent
                </span>
              </div>
            </div>

            {/* End Call Button */}
            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to end the interview?")
                ) {
                  window.parent.postMessage({ type: "END_INTERVIEW" }, "*");
                  window.location.href = "/";
                }
              }}
              className="w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-red-200 flex items-center justify-center gap-2"
            >
              <PhoneXMarkIcon className="w-5 h-5" />
              End Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Room3Page() {
  const searchParams = useSearchParams();
  const [room] = useState(() => new Room());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(true);
  const [participantName, setParticipantName] = useState<string>("");
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [jobInfo, setJobInfo] = useState<any>(null);

  const directToken = searchParams.get("token");
  const directRoomName = searchParams.get("roomName");
  const directServerUrl = searchParams.get("serverUrl");
  const phone = searchParams.get("phone");
  const jobId = searchParams.get("jobId");
  const backendRoomName = searchParams.get("roomName");

  // Extract participant name from URL parameters
  useEffect(() => {
    const participantNameParam = searchParams.get("participantName");
    if (participantNameParam) {
      setParticipantName(participantNameParam);
    }
  }, [searchParams]);

  const handleStartInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setNeedsPermission(false);
    } catch (err) {
      setError(
        "Microphone and camera permissions are required for the interview."
      );
    }
  };

  useEffect(() => {
    if (needsPermission) return;

    const connectToRoom = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        let token = directToken;
        let roomName = directRoomName;
        let serverUrl =
          directServerUrl || "wss://rolvate2-ckmk80qb.livekit.cloud";

        if (!token && phone && jobId && backendRoomName) {
          const createResponse = await fetch(
            "http://localhost:4005/api/room/create-new-room",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jobId, phone, roomName: backendRoomName }),
            }
          );

          if (!createResponse.ok) {
            throw new Error(
              `Failed to create room: ${await createResponse.text()}`
            );
          }

          const createData = await createResponse.json();
          console.log("✅ Room created successfully:", createData);

          // Extract token and room information from response
          token = createData.token;
          // Try multiple possible room name fields from the API response
          roomName =
            createData.room?.name || createData.roomName || createData.room?.id;
          serverUrl = createData.liveKitUrl;

          // Extract comprehensive interview context from backend response
          if (createData.interviewContext) {
            // Set job information from interview context
            setJobInfo({
              title: createData.interviewContext.jobName,
              company: createData.interviewContext.companyName,
              prompt: createData.interviewContext.interviewPrompt,
              type:
                createData.interviewSummary?.interviewType || "video_interview",
            });

            // Set company information
            setCompanyInfo({
              name: createData.interviewContext.companyName,
            });
          }

          // Set participant name
          if (
            createData.participantName ||
            createData.interviewContext?.candidateName
          ) {
            setParticipantName(
              createData.participantName ||
                createData.interviewContext.candidateName
            );
          }
        }

        if (!token || !roomName) {
          console.error("❌ Missing required parameters:", {
            token: !!token,
            roomName,
            hasDirectToken: !!directToken,
            hasDirectRoomName: !!directRoomName,
            phone,
            jobId,
            backendRoomName,
          });
          throw new Error(
            `Missing token or roomName parameters. Token: ${!!token}, RoomName: ${roomName}`
          );
        }

        console.log("🚀 Connecting to LiveKit room:", {
          roomName,
          serverUrl,
          tokenLength: token?.length,
        });

        room.removeAllListeners();
        room.on("connected", () => {
          setIsConnected(true);
          setIsConnecting(false);
        });
        room.on("disconnected", () => {
          setIsConnected(false);
          setIsConnecting(false);
        });
        room.on("reconnecting", () => setIsConnecting(true));
        room.on("reconnected", () => {
          setIsConnected(true);
          setIsConnecting(false);
        });

        await room.connect(serverUrl, token, {
          autoSubscribe: true,
          rtcConfig: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          },
        });

        await room.localParticipant.setMicrophoneEnabled(true);
        await room.localParticipant.setCameraEnabled(true, {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        });
      } catch (err: any) {
        setError(err.message || "Failed to connect to room");
        setIsConnecting(false);
      }
    };

    connectToRoom();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return "Are you sure you want to leave? This will end the interview.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    needsPermission,
    directToken,
    directRoomName,
    directServerUrl,
    phone,
    jobId,
    backendRoomName,
  ]);

  const PageWrapper = ({
    children,
    title,
    description,
  }: {
    children: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-12 interview-scale-in">
          {children}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );

  const PrimaryButton = ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] hover:from-[#0891b2] hover:to-[#13ead9] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
    >
      {children}
    </button>
  );

  if (needsPermission) {
    return (
      <PageWrapper
        title="Interview Setup"
        description="Please allow access to your microphone and camera to begin the interview."
      >
        <div className="relative w-20 h-20 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg interview-pulse-glow">
          <VideoCameraIcon className="w-10 h-10 text-white" />
        </div>
        <PrimaryButton onClick={handleStartInterview}>
          Start Interview
        </PrimaryButton>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Connection Error" description={error}>
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
        </div>
        <PrimaryButton onClick={() => window.location.reload()}>
          Try Again
        </PrimaryButton>
      </PageWrapper>
    );
  }

  if (isConnecting) {
    return (
      <PageWrapper
        title="Connecting..."
        description="Setting up your interview session."
      >
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-[#13ead9] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col relative overflow-hidden">
        <ParticleBackground />

        {/* Header */}
        <header className="bg-white/95 backdrop-blur-lg border-b border-slate-200/50 shadow-sm sticky top-0 z-20">
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-xl flex items-center justify-center shadow-lg">
                  <VideoCameraIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Room 3</h1>
                  <p className="text-xs text-slate-500">Rolevate Platform</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full border border-slate-200/50">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    } animate-pulse`}
                  ></div>
                  <span className="text-sm font-medium">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-6">
          <div className="w-full">
            {isConnected ? (
              <InterviewUI
                jobInfo={jobInfo}
                companyInfo={companyInfo}
                participantName={participantName}
              />
            ) : (
              <PageWrapper
                title="Waiting for Connection"
                description="Establishing connection to the interview room."
              >
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <VideoCameraSlashIcon className="w-10 h-10 text-slate-500" />
                </div>
              </PageWrapper>
            )}
          </div>
        </main>

        <div className="fixed top-0 left-0 w-0 h-0 overflow-visible">
          <RoomAudioRenderer volume={1.0} muted={false} />
        </div>
      </div>
    </RoomContext.Provider>
  );
}
