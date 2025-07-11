"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import InterviewRoom from "@/components/interview/InterviewRoom";

// This will come from your backend API
interface InterviewData {
  token: string;
  roomName: string;
  serverUrl: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roomId = params.roomId as string;

  useEffect(() => {
    // In real implementation, this would fetch from your backend API
    // For now, we'll simulate the data that would come from backend
    const fetchInterviewData = async () => {
      try {
        setLoading(true);

        // TODO: Replace with actual API call to your backend
        // const response = await fetch(`/api/interview/${roomId}`);
        // const data = await response.json();

        // Simulated data that your backend would provide
        const simulatedData: InterviewData = {
          token: "your-livekit-token-from-backend", // Backend generates this
          roomName: roomId,
          serverUrl:
            process.env.NEXT_PUBLIC_LIVEKIT_URL ||
            "wss://rolvate2-ckmk80qb.livekit.cloud",
          jobTitle: "Senior Frontend Developer",
          companyName: "TechCorp Inc.",
          candidateName: "John Doe",
        };

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setInterviewData(simulatedData);
      } catch (err) {
        console.error("Failed to fetch interview data:", err);
        setError("Failed to load interview room");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchInterviewData();
    }
  }, [roomId]);

  const handleLeaveInterview = () => {
    // Navigate back to dashboard or wherever appropriate
    router.push("/userdashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#13ead9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 font-display">
            Preparing Interview Room
          </h2>
          <p className="text-gray-600 font-text">
            Setting up your interview environment...
          </p>
        </div>
      </div>
    );
  }

  if (error || !interviewData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 font-display">
            Unable to Load Interview
          </h2>
          <p className="text-gray-600 mb-6 font-text">
            {error || "Interview room not found or invalid"}
          </p>
          <button
            onClick={() => router.push("/userdashboard")}
            className="px-6 py-3 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white rounded-xl hover:from-[#0891b2] hover:to-[#13ead9] transition-all duration-200 font-semibold shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <InterviewRoom
      roomName={interviewData.roomName}
      token={interviewData.token}
      serverUrl={interviewData.serverUrl}
      onLeave={handleLeaveInterview}
      jobTitle={interviewData.jobTitle}
      companyName={interviewData.companyName}
      candidateName={interviewData.candidateName}
    />
  );
}
