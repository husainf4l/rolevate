"use client";

import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface NavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  loading: boolean;
  aiGenerating?: boolean;
  currentStep?: string;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function NavigationButtons({
  isFirstStep,
  isLastStep,
  loading,
  aiGenerating = false,
  currentStep,
  onPrevious,
  onNext,
  onCancel,
  onSubmit,
}: NavigationButtonsProps) {
  return (
    <div className="p-8 lg:p-12 bg-white/30 backdrop-blur-sm">
      <div className="flex justify-between">
        <button
          type="button"
          onClick={isFirstStep ? onCancel : onPrevious}
          className="flex items-center gap-2 px-6 py-3 bg-white/80 border border-[#d2d2d7] text-[#1d1d1f] rounded-xl hover:bg-white/90 transition-all duration-200 font-medium backdrop-blur-sm"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          {isFirstStep ? "Cancel" : "Previous"}
        </button>

        <button
          type="button"
          onClick={isLastStep ? onSubmit : onNext}
          disabled={loading || aiGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white rounded-xl hover:from-[#0891b2] hover:to-[#0e7490] transition-all duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating...
            </>
          ) : aiGenerating && currentStep === "basic" ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating Job Analysis...
            </>
          ) : aiGenerating && currentStep === "details" ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating AI Configuration...
            </>
          ) : aiGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating with AI...
            </>
          ) : isLastStep ? (
            <>
              <CheckCircleIcon className="w-4 h-4" />
              Publish Job
            </>
          ) : (
            <>
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
