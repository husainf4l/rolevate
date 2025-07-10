"use client";

import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { StepConfig, FormStep } from "./types";

interface ProgressIndicatorProps {
  steps: StepConfig[];
  currentStep: FormStep;
}

export default function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  const getCurrentStepIndex = () => steps.findIndex(step => step.key === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted = getCurrentStepIndex() > index;
          const Icon = step.icon;
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white shadow-lg' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-[#d2d2d7] text-[#6e6e73]'
                }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className={`font-medium ${
                    isActive ? 'text-[#1d1d1f]' : isCompleted ? 'text-green-600' : 'text-[#6e6e73]'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-[#86868b] mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-px bg-[#d2d2d7] flex-1 max-w-24 mx-4 ${
                  isCompleted ? 'bg-green-300' : ''
                }`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}