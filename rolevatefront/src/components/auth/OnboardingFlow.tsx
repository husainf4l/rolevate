"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  completed?: boolean;
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: "company-setup",
      title: "Company Setup Complete",
      description: "Your company profile has been created successfully",
      icon: "🏢",
      href: "/company-setup",
      completed: true,
    },
    {
      id: "first-job",
      title: "Post Your First Job",
      description:
        "Create your first job posting to start attracting candidates",
      icon: "💼",
      href: "/dashboard/jobpost",
    },
    {
      id: "invite-team",
      title: "Invite Team Members",
      description: "Add your HR team and recruiters to collaborate",
      icon: "👥",
      href: "/dashboard/team",
    },
    {
      id: "setup-interviews",
      title: "Setup AI Interviews",
      description: "Configure your AI interview settings and questions",
      icon: "🤖",
      href: "/dashboard/interviews",
    },
    {
      id: "explore-dashboard",
      title: "Explore Dashboard",
      description: "Get familiar with your recruitment dashboard",
      icon: "📊",
      href: "/dashboard",
    },
  ];

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleSkipOnboarding = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#1E293B] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-[#00C6AD]/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Welcome to Rolevate!
          </h1>
          <p className="text-xl text-gray-300 mt-2">
            Your company is set up. Let's get you started with these quick
            steps.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-2">
            <span className="text-sm font-medium text-gray-300">
              {completedSteps.length} of {steps.length} steps completed
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-[#00C6AD] h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(completedSteps.length / steps.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {steps.map((step, index) => {
            const isCompleted =
              step.completed || completedSteps.includes(step.id);
            const isNext = !isCompleted && completedSteps.length === index;

            return (
              <div
                key={step.id}
                className={`relative bg-gray-800 rounded-lg border-2 p-6 transition-all duration-200 ${
                  isCompleted
                    ? "border-green-400 bg-green-900/20"
                    : isNext
                    ? "border-[#00C6AD] shadow-lg shadow-[#00C6AD]/10"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isNext
                        ? "bg-[#00C6AD] text-white"
                        : "bg-gray-600 text-gray-300"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>
                </div>

                {/* Step Content */}
                <div className="text-center">
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    {step.description}
                  </p>

                  {/* Action Button */}
                  {isCompleted ? (
                    <div className="inline-flex items-center text-green-400 text-sm font-medium">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Completed
                    </div>
                  ) : (
                    <Link href={step.href}>
                      <button
                        onClick={() => handleStepComplete(step.id)}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                          isNext
                            ? "bg-[#00C6AD] text-white hover:bg-[#14B8A6]"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {isNext ? "Start Now" : "Continue"}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link href="/dashboard">
            <button
              onClick={handleSkipOnboarding}
              className="w-full sm:w-auto px-8 py-3 bg-[#00C6AD] text-white font-medium rounded-md hover:bg-[#14B8A6] transition-colors"
            >
              Go to Dashboard
            </button>
          </Link>
          <button
            onClick={handleSkipOnboarding}
            className="w-full sm:w-auto px-8 py-3 border border-gray-600 text-gray-300 font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            Skip Onboarding
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Need Help Getting Started?
            </h3>
            <p className="text-gray-300 mb-4">
              Our team is here to help you make the most of Rolevate.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link
                href="/help"
                className="text-[#00C6AD] hover:text-[#14B8A6] font-medium"
              >
                📚 View Documentation
              </Link>
              <Link
                href="/contact"
                className="text-[#00C6AD] hover:text-[#14B8A6] font-medium"
              >
                💬 Contact Support
              </Link>
              <Link
                href="/demo"
                className="text-[#00C6AD] hover:text-[#14B8A6] font-medium"
              >
                🎥 Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
