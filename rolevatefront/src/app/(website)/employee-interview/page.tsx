"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PublicInterviewService, {
  PublicInterviewRoomInfo,
  InterviewJoinResponse,
} from "@/services/public-interview.service";

export default function EmployeeInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode") || "";

  const [step, setStep] = useState<
    "room-code" | "employee-details" | "instructions" | "interview"
  >("room-code");
  const [roomInfo, setRoomInfo] = useState<PublicInterviewRoomInfo | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [employeeDetails, setEmployeeDetails] = useState({
    roomCode: roomCode,
    phoneNumber: "",
    firstName: "",
    lastName: "",
  });

  const publicInterviewService = PublicInterviewService;

  // Auto-load room info if room code is provided
  useEffect(() => {
    if (roomCode && roomCode.length >= 6) {
      setEmployeeDetails((prev) => ({ ...prev, roomCode }));
      handleLoadRoomInfo(roomCode);
    }
  }, [roomCode]);

  const handleLoadRoomInfo = async (code: string) => {
    if (!code || code.length < 6) {
      setError("Please enter a valid room code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const info = await publicInterviewService.getRoomInfo(code);
      setRoomInfo(info);
      setStep("employee-details");
      console.log("Room info loaded:", info);
    } catch (err: any) {
      setError(err.message || "Failed to load room information");
      console.error("Room loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinInterview = async () => {
    if (
      !employeeDetails.firstName ||
      !employeeDetails.lastName ||
      !employeeDetails.phoneNumber
    ) {
      setError("Please fill in all your details");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const joinResponse: InterviewJoinResponse =
        await publicInterviewService.joinInterview(employeeDetails.roomCode, {
          phoneNumber: employeeDetails.phoneNumber,
          firstName: employeeDetails.firstName,
          lastName: employeeDetails.lastName,
        });

      console.log("Interview joined successfully:", joinResponse);

      // Redirect to the actual interview room with the session data
      const params = new URLSearchParams({
        roomCode: employeeDetails.roomCode,
        sessionData: JSON.stringify(joinResponse),
      });

      router.push(`/room?${params.toString()}`);
    } catch (err: any) {
      setError(err.message || "Failed to join interview");
      console.error("Join interview error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, "");
    if (cleaned.startsWith("+962")) {
      return cleaned;
    }
    if (cleaned.startsWith("962")) {
      return `+${cleaned}`;
    }
    if (cleaned.length === 9 && /^[789]/.test(cleaned)) {
      return `+962${cleaned}`;
    }
    if (cleaned.startsWith("0") && cleaned.length === 10) {
      return `+962${cleaned.substring(1)}`;
    }
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  };

  if (step === "room-code") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎯 Join Interview
            </h1>
            <p className="text-gray-600">
              Enter your interview room code to get started
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Code
              </label>
              <input
                type="text"
                value={employeeDetails.roomCode}
                onChange={(e) =>
                  setEmployeeDetails({
                    ...employeeDetails,
                    roomCode: e.target.value.toUpperCase(),
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                placeholder="ABCD1234"
                maxLength={12}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the room code provided by your interviewer
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={() => handleLoadRoomInfo(employeeDetails.roomCode)}
              disabled={loading || employeeDetails.roomCode.length < 6}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              📋 Test Room Codes
            </h3>
            <div className="space-y-1 text-sm">
              <button
                onClick={() => {
                  setEmployeeDetails({
                    ...employeeDetails,
                    roomCode: "44FZU9BV",
                  });
                  handleLoadRoomInfo("44FZU9BV");
                }}
                className="block w-full text-left text-blue-600 hover:text-blue-800 font-mono"
              >
                44FZU9BV - Senior Backend Developer
              </button>
              <p className="text-gray-500 text-xs">
                Click to use test room code
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "employee-details") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              👋 Welcome!
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 font-semibold">
                {roomInfo?.jobTitle}
              </p>
              <p className="text-blue-600 text-sm">{roomInfo?.companyName}</p>
            </div>
            <p className="text-gray-600">
              Please provide your details to join the interview
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={employeeDetails.firstName}
                  onChange={(e) =>
                    setEmployeeDetails({
                      ...employeeDetails,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ahmed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={employeeDetails.lastName}
                  onChange={(e) =>
                    setEmployeeDetails({
                      ...employeeDetails,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Al-Rashid"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={employeeDetails.phoneNumber}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setEmployeeDetails({
                    ...employeeDetails,
                    phoneNumber: formatted,
                  });
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+962791234567"
              />
              <p className="text-xs text-gray-500 mt-1">
                Jordan format: +962XXXXXXXXX
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleJoinInterview}
                disabled={
                  loading ||
                  !employeeDetails.firstName ||
                  !employeeDetails.lastName ||
                  !employeeDetails.phoneNumber
                }
                className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Joining Interview..." : "Join Interview 🎥"}
              </button>

              <button
                onClick={() => setStep("room-code")}
                className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                ← Back to Room Code
              </button>
            </div>
          </div>

          {roomInfo && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">
                📝 Interview Details
              </h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>
                  <strong>Duration:</strong>{" "}
                  {Math.floor((roomInfo.maxDuration || 1800) / 60)} minutes
                </p>
                <p>
                  <strong>Type:</strong> {roomInfo.interviewType}
                </p>
                <p>
                  <strong>Status:</strong> {roomInfo.status}
                </p>
              </div>
              {roomInfo.instructions && (
                <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                  <strong>Instructions:</strong> {roomInfo.instructions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
