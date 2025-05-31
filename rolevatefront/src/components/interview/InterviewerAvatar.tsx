"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface InterviewerAvatarProps {
  isSpeaking: boolean;
  isActive: boolean;
}

export const InterviewerAvatar = ({
  isSpeaking,
  isActive,
}: InterviewerAvatarProps) => {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Add animation effect for the interviewer
  useEffect(() => {
    if (isSpeaking) {
      const animationInterval = setInterval(() => {
        setPulseAnimation((prev) => !prev);
      }, 800);

      return () => clearInterval(animationInterval);
    }
  }, [isSpeaking]);

  return (
    <div className="flex flex-col items-center mb-8">
      <div className={`relative ${pulseAnimation ? "animate-pulse" : ""}`}>
        <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-blue-500 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/70 z-10"></div>
          <Image
            src="/images/lailaherohr.png"
            alt="AI Interviewer Laila"
            width={160}
            height={160}
            className={`object-cover transition-transform duration-500 ${
              isSpeaking ? "scale-110" : "scale-100"
            }`}
          />
        </div>

        {isActive && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-xs text-white px-2 py-0.5 rounded-full">
            Live
          </div>
        )}

        {isSpeaking && (
          <div className="absolute -top-1 -right-1 h-5 w-5">
            <span className="animate-ping absolute h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="absolute h-full w-full rounded-full bg-blue-500"></span>
          </div>
        )}
      </div>

      {/* Sound wave animation when speaking */}
      {isSpeaking && (
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
    </div>
  );
};
