"use client";

import React, { useState, useEffect } from "react";
import InterviewRoom from "@/components/interview/InterviewRoom";

export default function InterviewPage() {
  const [roomToken, setRoomToken] = useState<string>("");
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [error, setError] = useState<string>("");
  const [roomName] = useState("interview-room-" + Date.now());

  // LiveKit configuration
  const LIVEKIT_URL =
    process.env.NEXT_PUBLIC_LIVEKIT_URL ||
    "wss://rolvate2-ckmk80qb.livekit.cloud";

  const generateToken = async () => {
    try {
      setIsGeneratingToken(true);
      setError("");

      // In a real app, this would be a secure API call to your backend
      // For now, we'll use a simple demo token generation
      const response = await fetch("/api/interview/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName,
          participantName: "Candidate",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate token");
      }

      const data = await response.json();
      setRoomToken(data.token);
    } catch (err) {
      console.error("Token generation error:", err);
      setError("Failed to generate interview token. Please try again.");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Generate token on component mount
  useEffect(() => {
    generateToken();
  }, [generateToken]);

  const handleLeaveInterview = () => {
    setRoomToken("");
    // Redirect or show end screen
    window.history.back();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-6 font-text">{error}</p>
          <button
            onClick={generateToken}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white rounded-xl hover:from-[#0891b2] hover:to-[#13ead9] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isGeneratingToken || !roomToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#13ead9]/20 to-[#0891b2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-[#0891b2] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">
            Preparing Interview Room
          </h2>
          <p className="text-gray-600 font-text">
            Setting up your interview environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <InterviewRoom
      roomName={roomName}
      token={roomToken}
      serverUrl={LIVEKIT_URL}
      onLeave={handleLeaveInterview}
      jobTitle="Frontend Developer Interview"
      companyName="Rolevate"
    />
  );
}
