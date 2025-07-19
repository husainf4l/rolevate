import React from "react";
import Logo from "@/components/common/logo";
import {
  MicrophoneIcon,
  VideoCameraIcon,
  PhoneIcon,
  VideoCameraSlashIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { useMediaControls } from "../hooks/useMediaControls";
import { useRoomContext } from "@livekit/components-react";

export function InterviewHeader() {
  const room = useRoomContext();
  const { isCameraEnabled, isMicEnabled, toggleCamera, toggleMicrophone } =
    useMediaControls();

  const handleDisconnect = () => {
    room.disconnect();
  };

  const ControlButton = ({
    onClick,
    children,
    className,
    ariaLabel,
  }: {
    onClick: () => void;
    children: React.ReactNode;
    className: string;
    ariaLabel: string;
  }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`p-3 rounded-full transition-colors duration-200 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="w-px h-8 bg-slate-200"></div>
        <div className="text-slate-600">
          <p className="font-semibold text-lg">Technical Interview</p>
          <p className="text-sm text-slate-500">Candidate: John Doe</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ControlButton
          onClick={toggleMicrophone}
          ariaLabel={
            isMicEnabled ? "Mute microphone" : "Unmute microphone"
          }
          className={
            isMicEnabled
              ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
              : "bg-red-100 text-red-600 hover:bg-red-200"
          }
        >
          <MicrophoneIcon className="w-6 h-6" />
        </ControlButton>

        <div className="relative group">
          <ControlButton
            onClick={toggleCamera}
            ariaLabel={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
            className={
              isCameraEnabled
                ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }
          >
            {isCameraEnabled ? (
              <VideoCameraIcon className="w-6 h-6" />
            ) : (
              <VideoCameraSlashIcon className="w-6 h-6" />
            )}
          </ControlButton>
          <button className="absolute -right-2 top-1/2 -translate-y-1/2 p-1 bg-slate-200 rounded-full group-hover:bg-slate-300">
            <ChevronDownIcon className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="w-px h-8 bg-slate-200 mx-2"></div>

        <ControlButton
          onClick={handleDisconnect}
          ariaLabel="Disconnect from call"
          className="bg-red-500 text-white hover:bg-red-600"
        >
          <PhoneIcon className="w-6 h-6" />
        </ControlButton>
      </div>
    </header>
  );
}
