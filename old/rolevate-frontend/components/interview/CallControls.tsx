"use client";

import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";

interface CallControlsProps {
  isCallActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onStartCall: () => void;
  onEndCall: () => void;
}

export const CallControls = ({
  isCallActive,
  isMuted,
  onToggleMute,
  onStartCall,
  onEndCall,
}: CallControlsProps) => {
  return (
    <div className="flex justify-center items-center gap-6 mt-8">
      {/* Mute button */}
      <button
        onClick={onToggleMute}
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
          onClick={onStartCall}
          className="group flex flex-col items-center justify-center transition-all duration-300 text-green-400 hover:text-green-300"
        >
          <div className="p-5 rounded-full mb-2 bg-green-600/30 group-hover:bg-green-600/40 transform transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-900/20 group-active:scale-95">
            <Phone size={32} />
          </div>
          <span className="text-sm font-medium">Start Interview</span>
        </button>
      ) : (
        <button
          onClick={onEndCall}
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
  );
};
