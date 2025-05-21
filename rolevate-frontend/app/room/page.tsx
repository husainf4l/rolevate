"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InterviewerAvatar } from "@/components/interview/InterviewerAvatar";
import { CallControls } from "@/components/interview/CallControls";
import { LiveKitRoom } from "@/components/interview/LiveKitRoom";
import { Participant } from "livekit-client";
import Image from "next/image";
import Link from "next/link";

export default function RoomPage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [interviewStatus, setInterviewStatus] = useState("ready"); // ready, connecting, active, completed
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{text: string, sender: "ai" | "user"}>>([]);
  const [userInput, setUserInput] = useState("");
  
  // LiveKit state
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  // Timer for call duration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  // Generate LiveKit token when interview starts
  const startInterview = async () => {
    setInterviewStatus("connecting");
    setIsAiResponding(true);

    try {
      // Get token from backend
      const response = await fetch(`/api/livekit-token?phone=${phone}`);
      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Set LiveKit configuration
      setToken(data.token);
      setServerUrl(process.env.NEXT_PUBLIC_LIVEKIT_URL ?? null);
      
      // Continue with interview initialization
      setTimeout(() => {
        setIsCallActive(true);
        setInterviewStatus("active");
        
        // Initial greeting
        setTimeout(() => {
          setIsAiResponding(false);
          setMessages([
            { 
              text: `Hello, thank you for joining our interview session. I'm Laila, your AI interviewer from Rolevate. I see your phone number is ${phone}. Let's start the interview for the Senior Relationship Manager position. Are you ready to begin?`, 
              sender: "ai" 
            }
          ]);
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Error starting interview:", error);
      setInterviewStatus("ready");
      setIsAiResponding(false);
      alert("Failed to connect to interview. Please try again.");
    }
  };

  // Handle LiveKit connection state changes
  const handleConnectionStateChanged = (state: string) => {
    console.log("Connection state changed:", state);
    if (state === "disconnected" || state === "failed") {
      setInterviewStatus(state === "failed" ? "ready" : "completed");
      setIsCallActive(false);
    }
  };

  // Handle when a participant connects
  const handleParticipantConnected = (participant: Participant) => {
    console.log("Participant connected:", participant.identity);
  };

  // Handle when a participant disconnects
  const handleParticipantDisconnected = (participant: Participant) => {
    console.log("Participant disconnected:", participant.identity);
  };

  // Handle data received from LiveKit
  const handleDataReceived = (data: any) => {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.type === "message") {
        setMessages(prev => [...prev, { text: parsedData.text, sender: "ai" }]);
      }
    } catch (error) {
      console.error("Error parsing data:", error);
    }
  };

  // handle LiveKit errors
  const handleLiveKitError = (error: Error) => {
    console.error("LiveKit error:", error);
    alert("An error occurred with the connection. Please try again.");
    setInterviewStatus("ready");
    setIsCallActive(false);
  };

  // Handle sending a message in the chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isAiResponding) return;
    
    // Add user message to chat
    const userMessage = { text: userInput.trim(), sender: "user" as const };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setUserInput("");
    
    // Simulate AI responding
    setIsAiResponding(true);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      // In a real app, this would be where you send the message to your backend
      // and get a response from the AI interviewer
      const aiResponse = { 
        text: "Thank you for your response. That's very insightful. Let me ask you another question...", 
        sender: "ai" as const 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsAiResponding(false);
    }, 2000);
  };
  
  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // End the interview
  const endInterview = () => {
    if (confirm("Are you sure you want to end this interview?")) {
      setIsCallActive(false);
      setInterviewStatus("completed");
    }
  };

  // If no phone number is provided, show error
  if (!phone) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-[#1E293B] p-8 rounded-xl border border-[#334155] max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4">Invalid Interview Link</h2>
          <p className="text-[#94A3B8] mb-6">
            No phone number provided. Please use a valid interview link or return to the main page.
          </p>
          <Link 
            href="/"
            className="inline-block bg-[#00A99D] hover:bg-[#008F85] text-[#022B25] px-6 py-3 rounded-lg font-medium transition duration-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Interview Session</h1>
          {isCallActive && (
            <div className="bg-slate-700 px-4 py-2 rounded-full flex items-center">
              <div className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
              <span>{formatTime(callDuration)}</span>
            </div>
          )}
        </div>

        {/* Call UI */}
        <div className="bg-slate-800 rounded-lg p-4 sm:p-6 mb-8">
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
            </div>
          </div>

          {/* Interview Interface */}
          <div className="mb-6">
            <div className="flex justify-center mb-8">
              <InterviewerAvatar 
                isSpeaking={isAiResponding} 
                isActive={isCallActive} 
              />
            </div>

            {/* Messages/Chat Interface */}
            <div className="bg-slate-900/50 rounded-lg p-4 max-h-96 overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  {interviewStatus === "ready" ? 
                    "Start the interview to begin chatting with the AI interviewer." :
                    "Connecting to interview session..."}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-3 ${
                          message.sender === "user" 
                            ? "bg-blue-600 text-white" 
                            : "bg-slate-700 text-gray-200"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input area - only show when call is active */}
            {isCallActive && (
              <form onSubmit={handleSendMessage} className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your response..."
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isAiResponding}
                  />
                  <button
                    type="submit"
                    disabled={isAiResponding || !userInput.trim()}
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
              disabled={!isCallActive && interviewStatus !== "ready"}
            >
              <div
                className={`p-4 rounded-full mb-2 transform transition-all duration-300 ${
                  isMuted
                    ? "bg-red-600/20 group-hover:bg-red-600/30 group-active:scale-90"
                    : "bg-slate-700/40 group-hover:bg-slate-700/60 group-active:scale-90"
                }`}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium">
                {isMuted ? "Unmute" : "Mute"}
              </span>
            </button>

            {/* Start/End Call Button */}
            {!isCallActive && interviewStatus !== "completed" ? (
              <button
                onClick={startInterview}
                className="group flex flex-col items-center justify-center transition-all duration-300 text-green-400 hover:text-green-300"
              >
                <div className="p-5 rounded-full mb-2 bg-green-600/30 group-hover:bg-green-600/40 transform transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-900/20 group-active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium">Start Interview</span>
              </button>
            ) : interviewStatus !== "completed" ? (
              <button
                onClick={endInterview}
                className="group flex flex-col items-center justify-center transition-all duration-300 text-red-400 hover:text-red-300"
              >
                <div className="p-5 rounded-full mb-2 bg-red-600/30 group-hover:bg-red-600/40 transform transition-all duration-300 group_hover:shadow-lg group-hover:shadow-red-900/20 group-active:scale-95 border border-red-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
                    <line x1="23" y1="1" x2="1" y2="23"></line>
                  </svg>
                </div>
                <span className="text-sm font-medium">End Interview</span>
              </button>
            ) : (
              <Link 
                href="/"
                className="group flex flex-col items-center justify-center transition-all duration-300 text-blue-400 hover:text-blue-300"
              >
                <div className="p-5 rounded-full mb-2 bg-blue-600/30 group-hover:bg-blue-600/40 transform transition-all duration-300 group_hover:shadow-lg group-hover:shadow-blue-900/20 group-active:scale-95 border border-blue-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <span className="text-sm font-medium">Return Home</span>
              </Link>
            )}

            {/* Volume control */}
            <button className="group flex flex-col items-center justify-center transition-all duration-300 text-gray-300 hover:text-white">
              <div className="p-4 rounded-full mb-2 bg-slate-700/40 group-hover:bg-slate-700/60 transform transition-all duration-300 group-active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              </div>
              <span className="text-xs font-medium">Volume</span>
            </button>
          </div>
        </div>

        <div className="flex justify-start mt-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
