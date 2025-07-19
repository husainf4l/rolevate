import React from "react";
import {
  VideoCameraIcon,
  ExclamationTriangleIcon,
  VideoCameraSlashIcon,
} from "@heroicons/react/24/outline";
import ParticleBackground from "@/components/interview/ParticleBackground";

interface ConnectionManagerProps {
  needsPermission: boolean;
  error: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  onStartInterview: () => void;
}

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
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-12 animate-in slide-in-from-bottom-4 duration-500">
        {children}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 font-display tracking-tight">
          {title}
        </h2>
        <p className="text-gray-600 mb-8 font-text leading-relaxed">
          {description}
        </p>
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
    className="w-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] hover:from-[#0891b2] hover:to-[#13ead9] text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:ring-offset-2"
  >
    {children}
  </button>
);

export function ConnectionManager({
  needsPermission,
  error,
  isConnecting,
  isConnected,
  onStartInterview,
}: ConnectionManagerProps) {
  if (needsPermission) {
    return (
      <PageWrapper
        title="Interview Setup"
        description="Please allow access to your microphone and camera to begin the interview session."
      >
        <div className="relative w-20 h-20 bg-gradient-to-br from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
          <VideoCameraIcon className="w-10 h-10 text-white" />
          <div className="absolute inset-0 rounded-2xl border-2 border-[#13ead9]/50 animate-ping"></div>
        </div>
        <PrimaryButton onClick={onStartInterview}>
          Grant Permissions & Start
        </PrimaryButton>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title="Connection Error"
        description={error || "An unexpected error occurred while connecting."}
      >
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-50/80 rounded-xl text-left">
          <p className="font-medium mb-2">
            This page requires specific URL parameters to function correctly.
            Please ensure you have the correct link.
          </p>
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
        title="Connecting to Interview"
        description="Setting up your secure interview session. This won't take long."
      >
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-[#13ead9] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-[#0891b2]/30 border-b-transparent rounded-full animate-spin animation-delay-150 mx-auto"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!isConnected) {
    return (
      <PageWrapper
        title="Waiting for Connection"
        description="Establishing connection to the interview room. Please wait."
      >
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <VideoCameraSlashIcon className="w-10 h-10 text-slate-500" />
        </div>
      </PageWrapper>
    );
  }

  return null;
}
