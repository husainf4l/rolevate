// Room Access Demo Component
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RoomDemo() {
  const [roomCode, setRoomCode] = useState("");

  // Example room codes for demo
  const demoRooms = [
    {
      code: "44FZU9BV",
      position: "Senior Relationship Manager",
      company: "Capital Bank",
      status: "active",
    },
    {
      code: "TECH2025DEV",
      position: ".NET Senior Developer",
      company: "Menaitech",
      status: "active",
    },
    {
      code: "HR2025TAL",
      position: "Talent Manager",
      company: "Menaitech",
      status: "waiting",
    },
  ];

  const generateRoomLink = (code: string) => {
    return `/room?roomCode=${code}`;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Interview Room <span className="text-[#00C6AD]">Access Demo</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">
            Try the new room code-based interview access system
          </p>
        </div>

        {/* Room Code Input */}
        <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155] mb-8">
          <h2 className="text-xl font-bold mb-4">Enter Room Code</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter interview room code"
              className="flex-1 bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00C6AD] focus:border-transparent text-[#F8FAFC]"
              maxLength={12}
            />
            <Link
              href={generateRoomLink(roomCode)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                roomCode.length >= 6
                  ? "bg-[#00C6AD] hover:bg-[#00B89E] text-white"
                  : "bg-gray-600 cursor-not-allowed text-gray-300"
              }`}
            >
              Join Interview
            </Link>
          </div>
          <p className="text-sm text-[#94A3B8] mt-2">
            Room codes are typically 6-12 alphanumeric characters
          </p>
        </div>

        {/* Demo Room Codes */}
        <div className="bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
          <h2 className="text-xl font-bold mb-4">Demo Interview Rooms</h2>
          <div className="grid gap-4">
            {demoRooms.map((room) => (
              <div
                key={room.code}
                className="bg-[#0F172A] p-4 rounded-lg border border-[#334155] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-[#00C6AD]">
                      {room.code}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {room.status}
                    </span>
                  </div>
                  <p className="font-medium text-[#F8FAFC]">{room.position}</p>
                  <p className="text-sm text-[#94A3B8]">{room.company}</p>
                </div>
                <Link
                  href={generateRoomLink(room.code)}
                  className="bg-[#00C6AD] hover:bg-[#00B89E] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Join
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-[#1E293B] p-6 rounded-xl border border-[#334155]">
          <h3 className="text-lg font-bold mb-3">How the New System Works</h3>
          <ul className="space-y-2 text-[#94A3B8]">
            <li className="flex items-start gap-2">
              <span className="text-[#00C6AD] mt-1">•</span>
              <span>
                Candidates receive a room code (e.g., 44FZU9BV) to join their
                interview
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00C6AD] mt-1">•</span>
              <span>
                They enter their contact details (firstName, lastName,
                phoneNumber)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00C6AD] mt-1">•</span>
              <span>
                Backend validates and returns LiveKit connection details
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00C6AD] mt-1">•</span>
              <span>
                Frontend connects directly to LiveKit using provided token
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00C6AD] mt-1">•</span>
              <span>Real-time interview session with AI interviewer</span>
            </li>
          </ul>

          <div className="mt-4 p-3 bg-[#0F172A] rounded-lg border border-[#334155]">
            <h4 className="text-sm font-bold mb-2 text-[#00C6AD]">
              API Response Example:
            </h4>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {`{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "serverUrl": "wss://rolvate-fi6h6rke.livekit.cloud",
  "roomName": "interview_44FZU9BV",
  "identity": "candidate_962796026659",
  "participantName": "Al-hussein Abdullah",
  "jobTitle": "Senior Backend Developer - Fintech",
  "instructions": "Welcome to your interview...",
  "maxDuration": 1800
}`}
            </pre>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-[#00C6AD] hover:text-[#00B89E] underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
