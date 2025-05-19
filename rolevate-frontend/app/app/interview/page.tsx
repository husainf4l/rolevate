"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Participant } from "livekit-client";
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import Image from "next/image";
import { InterviewerAvatar } from "@/components/interview/InterviewerAvatar";
import { CallControls } from "@/components/interview/CallControls";
import { BankDetails } from "@/components/interview/BankDetails";
import { PositionDetails } from "@/components/interview/PositionDetails";
import { InterviewProgress } from "@/components/interview/InterviewProgress";
import { QuestionDisplay } from "@/components/interview/QuestionDisplay";
import { LiveKitRoom } from "@/components/interview/LiveKitRoom";
import livekitService from "@/services/livekit-service";

export default function InterviewPage() {
  // State for LiveKit
  const [token, setToken] = useState<string>("");
  const [serverUrl, setServerUrl] = useState<string>("");
  const [aiParticipant, setAiParticipant] = useState<Participant | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");

  // UI state
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [interviewStatus, setInterviewStatus] = useState("ready"); // ready, connecting, active, completed
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  // State for interview results
  const [interviewSummary, setInterviewSummary] = useState<string | null>(null);
  const [interviewTranscript, setInterviewTranscript] = useState<string | null>(
    null
  );

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Setup WebSocket connection
  useEffect(() => {
    if (!sessionId || !isCallActive) return;

    const wsUrl = `ws://localhost:4003`; // Use the same URL as your API
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Join the interview session
      ws.send(
        JSON.stringify({
          event: "joinInterview",
          data: { sessionId },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket message:", message);

        // Handle different message types
        switch (message.event) {
          case "aiInterviewerMessage":
            setIsAiResponding(true);
            setTimeout(() => {
              setIsAiResponding(false);
              setCurrentQuestion(message.data.message);
            }, 1500);
            break;

          case "interviewEnded":
            endInterview();
            break;

          case "error":
            setError(message.data.message);
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setSocket(ws);

    // Cleanup
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [sessionId, isCallActive]);

  // Function to send a message through WebSocket
  const sendWsMessage = (event: string, data: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected");
      return;
    }

    socket.send(JSON.stringify({ event, data }));
  };

  // Start interview with LiveKit
  const startInterview = async () => {
    setInterviewStatus("connecting");
    setPulseAnimation(true);
    setError(null);

    try {
      // Generate a unique room name
      const generatedRoomName = `interview-${Date.now()}`;
      setRoomName(generatedRoomName);

      // 1. Create a room
      await livekitService.createRoom(generatedRoomName);

      // 2. Get token for the candidate
      const candidateId = `candidate-${Date.now()}`;
      const candidateName = "Test Candidate"; // In a real app, this would come from user input or profile

      let tokenData;
      try {
        // Try with GET method first
        tokenData = await livekitService.getToken(
          generatedRoomName,
          candidateId,
          candidateName
        );
      } catch (err) {
        console.log("GET token failed, trying POST method");
        // Fall back to POST method
        tokenData = await livekitService.getTokenPost(
          generatedRoomName,
          candidateId,
          candidateName
        );
      }

      setToken(tokenData.token);

      // 3. Create an interview session
      const jobDescription = "Example job description for a technical role";
      const sessionData = await livekitService.createInterviewSession(
        generatedRoomName,
        candidateId,
        jobDescription
      );
      setSessionId(sessionData.sessionId);

      // 4. Start the interview session
      await livekitService.startInterview(sessionData.sessionId);

      // Set the server URL from environment variables
      setServerUrl(
        process.env.NEXT_PUBLIC_LIVEKIT_URL || "http://localhost:4003"
      );

      // If everything is successful, set the interview as active
      setIsCallActive(true);
      setInterviewStatus("active");
      startCallTimer();
    } catch (error) {
      console.error("Failed to setup interview:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(
        `Failed to start interview: ${errorMessage}. Falling back to simulation mode.`
      );
      // Continue with simulation for demo purposes
      simulateConnection();
    }
  };

  // Simulate connection for demo purposes (when LiveKit is not set up)
  const simulateConnection = () => {
    setTimeout(() => {
      setIsCallActive(true);
      setInterviewStatus("active");
      setIsAiResponding(true);

      setTimeout(() => {
        setIsAiResponding(false);
        setCurrentQuestion(
          "Hello, I'm Laila from the engineering team. Thank you for joining this interview today. Could you please introduce yourself and tell me about your relevant experience?"
        );
      }, 2000);

      // Start timer for call duration
      startCallTimer();
    }, 2000);
  };

  const endInterview = async () => {
    try {
      // End the interview session if we have a sessionId
      if (sessionId) {
        // Try to end via WebSocket first if available
        if (socket && socket.readyState === WebSocket.OPEN) {
          sendWsMessage("endInterview", { sessionId });
        } else {
          // Fall back to REST API
          await livekitService.endInterview(sessionId);
        }
      }

      setIsCallActive(false);
      setInterviewStatus("completed");
      setToken("");

      // Try to fetch the interview results
      fetchInterviewResults();

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Fetch interview results
      fetchInterviewResults();
    } catch (error) {
      console.error("Failed to end interview:", error);
      // Still mark the interview as ended on the client side
      setIsCallActive(false);
      setInterviewStatus("completed");
      setToken("");

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const fetchInterviewResults = async () => {
    if (!sessionId) return;

    try {
      // Fetch summary
      const summaryData = await livekitService.getInterviewSummary(sessionId);
      if (summaryData && summaryData.summary) {
        setInterviewSummary(summaryData.summary);
      }

      // Fetch transcript
      const transcriptData = await livekitService.getInterviewTranscript(
        sessionId
      );
      if (transcriptData && transcriptData.transcript) {
        setInterviewTranscript(transcriptData.transcript);
      }
    } catch (error) {
      console.error("Error fetching interview results:", error);
      setError("Could not load interview results. Please try again later.");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);

    // If we're actually connected to LiveKit, mute/unmute the audio track
    if (aiParticipant) {
      // Implement muting logic for LiveKit
    }
  };

  const startCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  // Handle LiveKit connection state changes
  const handleConnectionStateChanged = (state: string) => {
    console.log("Connection state changed:", state);

    if (state === "connected") {
      setIsCallActive(true);
      setInterviewStatus("active");
      startCallTimer();
    } else if (state === "disconnected") {
      if (isCallActive) {
        setInterviewStatus("completed");
      }
      setIsCallActive(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Handle participant connected
  const handleParticipantConnected = (participant: Participant) => {
    console.log("Participant connected:", participant.identity);
    if (participant.identity === "ai-interviewer") {
      setAiParticipant(participant);
    }
  };

  // Handle participant disconnected
  const handleParticipantDisconnected = (participant: Participant) => {
    console.log("Participant disconnected:", participant.identity);
    if (participant.identity === "ai-interviewer") {
      setAiParticipant(null);
    }
  };

  // Handle data received from the AI
  const handleDataReceived = (data: any) => {
    console.log("Data received:", data);

    if (data.type === "question") {
      setIsAiResponding(true);

      // Add a random delay between 1-3 seconds to make it feel more natural
      const delay = Math.floor(Math.random() * 2000) + 1000;

      setTimeout(() => {
        setIsAiResponding(false);
        setCurrentQuestion(data.text);
      }, delay);
    } else if (data.type === "interviewEnded") {
      endInterview();
    } else if (data.type === "aiSpeaking") {
      setIsAiResponding(data.speaking);
    }
  };

  // Handle sending candidate's response
  const sendCandidateResponse = async (response: string) => {
    if (!sessionId) {
      console.warn("Cannot send response: No active session");
      return;
    }

    try {
      // Try to send via WebSocket first if available
      if (socket && socket.readyState === WebSocket.OPEN) {
        sendWsMessage("candidateResponse", { sessionId, response });
      } else {
        // Fall back to REST API
        await livekitService.sendCandidateResponse(sessionId, response);
      }

      // After sending response, simulate AI is thinking
      setIsAiResponding(true);

      // For demo purposes, after a delay, show AI's next question
      setTimeout(() => {
        setIsAiResponding(false);
        // This would normally come from the server via WebSocket
        const nextQuestion =
          "That's interesting. Could you elaborate more on your experience?";
        setCurrentQuestion(nextQuestion);
      }, 3000);
    } catch (error) {
      console.error("Failed to send candidate response:", error);
    }
  };

  // Function to handle user's text input (could be connected to a text input component)
  const handleUserInput = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = formData.get("response") as string;

    if (response.trim()) {
      sendCandidateResponse(response);
      (event.target as HTMLFormElement).reset();
    }
  };

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Simulate AI responses during the interview
  useEffect(() => {
    if (!isCallActive) return;

    // Predefined interview questions
    const questions = [
      "Could you tell me about a challenging project you've worked on recently?",
      "How do you approach problem-solving when faced with a complex technical issue?",
      "Can you describe your experience with team collaboration and how you handle disagreements?",
      "What technologies or frameworks are you most experienced with?",
      "How do you stay updated with the latest industry trends and technologies?",
    ];

    // Simulate AI asking questions periodically
    const questionInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        // Randomly decide to ask a new question
        setIsAiResponding(true);
        setPulseAnimation(true);

        setTimeout(() => {
          setIsAiResponding(false);
          const randomQuestion =
            questions[Math.floor(Math.random() * questions.length)];
          setCurrentQuestion(randomQuestion);
        }, 3000);
      }
    }, 20000); // Every 20 seconds there's a chance for a new question

    return () => clearInterval(questionInterval);
  }, [isCallActive]);

  // Add animation effect for the interviewer
  useEffect(() => {
    if (isAiResponding) {
      const animationInterval = setInterval(() => {
        setPulseAnimation((prev) => !prev);
      }, 800);

      return () => clearInterval(animationInterval);
    }
  }, [isAiResponding]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // End interview session if active
      if (sessionId) {
        livekitService.endInterview(sessionId).catch((err) => {
          console.error("Error ending interview during cleanup:", err);
        });
      }

      // Close WebSocket connection
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [sessionId, socket]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-rolevate-primaryText p-8">
      {" "}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Live Interview Session</h1>
          {isCallActive && (
            <div className="bg-slate-700 px-4 py-2 rounded-full flex items-center">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
              <span>{formatTime(callDuration)}</span>
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Call UI */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          {/* Participant info */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {isCallActive ? (
                <div className="bg-green-500 h-3 w-3 rounded-full mr-2"></div>
              ) : (
                <div className="bg-gray-500 h-3 w-3 rounded-full mr-2"></div>
              )}
              <span className="font-medium">Laila (AI Interviewer)</span>
              {isAiResponding && (
                <div className="ml-3 text-blue-400 text-sm">Speaking...</div>
              )}
            </div>
            <div className="text-sm text-gray-400">
              {interviewStatus === "ready" && "Waiting to start"}
              {interviewStatus === "connecting" && "Connecting..."}
              {interviewStatus === "active" && "In call"}
              {interviewStatus === "completed" && "Interview completed"}
              {socket && socket.readyState === WebSocket.OPEN && (
                <span className="ml-2 text-green-400">• Live</span>
              )}
            </div>
          </div>

          {/* LiveKit Room or Interviewer Avatar */}
          {token && serverUrl ? (
            <LiveKitRoom
              token={token}
              serverUrl={serverUrl}
              onConnectionStateChanged={handleConnectionStateChanged}
              onParticipantConnected={handleParticipantConnected}
              onParticipantDisconnected={handleParticipantDisconnected}
              onDataReceived={handleDataReceived}
              onError={(error) => console.error("LiveKit error:", error)}
            >
              <div className="flex flex-col items-center mb-8">
                <InterviewerAvatar
                  isSpeaking={isAiResponding}
                  isActive={isCallActive}
                />
                <QuestionDisplay question={currentQuestion} />

                {/* Response input */}
                {isCallActive && (
                  <form
                    onSubmit={handleUserInput}
                    className="mt-6 w-full max-w-lg"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="response"
                        placeholder="Type your response here..."
                        className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isAiResponding}
                      />
                      <button
                        type="submit"
                        disabled={isAiResponding}
                        className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-500 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <CallControls
                isCallActive={isCallActive}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                onStartCall={startInterview}
                onEndCall={endInterview}
              />
            </LiveKitRoom>
          ) : (
            <>
              {/* Animated Interviewer */}
              <div className="flex flex-col items-center mb-8">
                <div
                  className={`relative ${
                    pulseAnimation ? "animate-pulse" : ""
                  }`}
                >
                  <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-blue-500 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/70 z-10"></div>
                    <Image
                      src="/images/lailaherohr.png"
                      alt="AI Interviewer Laila"
                      width={160}
                      height={160}
                      className={`object-cover transition-transform duration-500 ${
                        isAiResponding ? "scale-110" : "scale-100"
                      }`}
                    />
                  </div>

                  {isCallActive && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-xs text-white px-2 py-0.5 rounded-full">
                      Live
                    </div>
                  )}

                  {isAiResponding && (
                    <div className="absolute -top-1 -right-1 h-5 w-5">
                      <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="absolute h-full w-full rounded-full bg-blue-500"></span>
                    </div>
                  )}
                </div>

                {/* Sound wave animation when speaking */}
                {isAiResponding && (
                  <div className="mt-4 flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 w-1 bg-blue-500 rounded-full"
                        style={{
                          animation: `soundWave 1s infinite ${i * 0.1}s`,
                          height: `${Math.random() * 16 + 8}px`,
                        }}
                      ></div>
                    ))}
                  </div>
                )}

                {/* Current question display */}
                {currentQuestion && (
                  <div className="mt-6 bg-slate-700 p-4 rounded-lg max-w-lg text-center shadow-lg border border-slate-600">
                    <p className="italic text-gray-300">
                      &ldquo;{currentQuestion}&rdquo;
                    </p>
                  </div>
                )}

                {/* Response input */}
                {isCallActive && (
                  <form
                    onSubmit={handleUserInput}
                    className="mt-6 w-full max-w-lg"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="response"
                        placeholder="Type your response here..."
                        className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isAiResponding}
                      />
                      <button
                        type="submit"
                        disabled={isAiResponding}
                        className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-500 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Call Controls */}
              <div className="flex justify-center items-center gap-6 mt-8">
                {/* Mute button */}
                <button
                  onClick={toggleMute}
                  className={`group flex flex-col items-center justify-center transition-all duration-300 ${
                    isMuted
                      ? "text-red-400 hover:text-red-300"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <div
                    className={`p-4 rounded-full mb-2 transform transition-all duration-300 ${
                      isMuted
                        ? "bg-red-600/20 group-hover:bg-red-600/30 group-active:scale-90"
                        : "bg-slate-700/40 group-hover:bg-slate-700/60 group-active:scale-90"
                    }`}
                  >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </div>
                  <span className="text-xs font-medium">
                    {isMuted ? "Unmute" : "Mute"}
                  </span>
                </button>

                {/* Start/End Call Button - Larger and more prominent */}
                {!isCallActive ? (
                  <button
                    onClick={startInterview}
                    className="group flex flex-col items-center justify-center transition-all duration-300 text-green-400 hover:text-green-300"
                  >
                    <div className="p-5 rounded-full mb-2 bg-green-600/30 group-hover:bg-green-600/40 transform transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-900/20 group-active:scale-95">
                      <Phone size={32} />
                    </div>
                    <span className="text-sm font-medium">Start Interview</span>
                  </button>
                ) : (
                  <button
                    onClick={endInterview}
                    className="group flex flex-col items-center justify-center transition-all duration-300 text-red-400 hover:text-red-300"
                  >
                    <div className="p-5 rounded-full mb-2 bg-red-600/30 group-hover:bg-red-600/40 transform transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-900/20 group-active:scale-95 border border-red-500/30">
                      <PhoneOff size={32} />
                    </div>
                    <span className="text-sm font-medium">End Interview</span>
                  </button>
                )}

                {/* Volume control */}
                <button className="group flex flex-col items-center justify-center transition-all duration-300 text-gray-300 hover:text-white">
                  <div className="p-4 rounded-full mb-2 bg-slate-700/40 group-hover:bg-slate-700/60 transform transition-all duration-300 group-active:scale-90">
                    <Volume2 size={24} />
                  </div>
                  <span className="text-xs font-medium">Volume</span>
                </button>
              </div>
            </>
          )}

          {/* Interview Information Panel */}
          <div className="mt-10 border-t border-slate-700 pt-6 text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bank Information */}
              <BankDetails
                name="Roxate Bank"
                division="Corporate Division"
                type="Global Banking Institution"
              />

              {/* Position Information */}
              <PositionDetails
                title="Senior Relationship Manager"
                department="Corporate Client Services"
                skills={[
                  "Client Relations",
                  "Financial Analysis",
                  "Corporate Banking",
                ]}
              />

              {/* Interview Progress */}
              <InterviewProgress
                callDuration={callDuration}
                formatTime={formatTime}
                status="Technical interview in progress"
              />
            </div>

            {/* Interview results section - shown after completion */}
            {interviewStatus === "completed" && (
              <div className="mt-8 border-t border-slate-700 pt-6">
                <h3 className="text-xl font-semibold mb-4">
                  Interview Results
                </h3>

                {/* Loading state */}
                {!interviewSummary && !interviewTranscript && !error && (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3">Loading interview results...</span>
                  </div>
                )}

                {/* Summary */}
                {interviewSummary && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-2">
                      Interview Summary
                    </h4>
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <p className="whitespace-pre-line">{interviewSummary}</p>
                    </div>
                  </div>
                )}

                {/* Transcript */}
                {interviewTranscript && (
                  <div>
                    <h4 className="text-lg font-medium mb-2">
                      Interview Transcript
                    </h4>
                    <div className="bg-slate-700/50 p-4 rounded-lg max-h-60 overflow-y-auto">
                      <p className="whitespace-pre-line">
                        {interviewTranscript}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-start mt-4">
          <Link href="/app">
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300">
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
