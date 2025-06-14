"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CompanyData,
  createCompany,
  AuthError,
  getCurrentUser,
} from "../../services/auth.service";

interface CompanySetupProps {
  onCompanyCreated?: () => void;
}

export default function CompanySetup({ onCompanyCreated }: CompanySetupProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Start with loading while checking auth status
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Company Info, 2: Subscription Plan

  // Check if the user is logged in and doesn't have a company yet
  useEffect(() => {
    async function checkUserAndCompany() {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          // User is not logged in, redirect to login
          router.push('/login');
          return;
        }
        
        if (user.companyId) {
          // User already has a company, redirect to dashboard
          router.push('/dashboard');
          return;
        }
        
        // User is logged in but doesn't have a company, allow setup
        setLoading(false);
      } catch (error) {
        console.error('Error checking user status:', error);
        // On error, redirect to login
        router.push('/login');
      }
    }
    
    checkUserAndCompany();
  }, [router]);

  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    displayName: "",
    industry: "",
    description: "",
    website: "",
    location: "",
    country: "",
    city: "",
    size: "MEDIUM",
    subscriptionPlan: "FREE",
  });

  const [selectedPlan, setSelectedPlan] = useState<
    "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE"
  >("FREE");

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Real Estate",
    "Media",
    "Non-profit",
    "Other",
  ];

  const companySizes = [
    { value: "SMALL", label: "1-10 employees" },
    { value: "MEDIUM", label: "11-50 employees" },
    { value: "LARGE", label: "51-200 employees" },
    { value: "ENTERPRISE", label: "200+ employees" },
  ];

  const subscriptionPlans = [
    {
      id: "FREE",
      name: "Free",
      price: "Free",
      subtitle: "Perfect to get started",
      features: [
        "3 job posts per month",
        "2 active interviews",
        "1 team member",
        "Basic AI analysis",
        "Community support",
      ],
    },
    {
      id: "BASIC",
      name: "Basic",
      price: "$29",
      subtitle: "For small teams",
      billing: "/month",
      features: [
        "10 job posts per month",
        "5 active interviews",
        "3 team members",
        "AI interview analysis",
        "Email support",
      ],
    },
    {
      id: "PREMIUM",
      name: "Premium",
      price: "$99",
      subtitle: "Most popular choice",
      billing: "/month",
      features: [
        "50 job posts per month",
        "25 active interviews",
        "15 team members",
        "AI interview analysis",
        "Custom branding",
        "Priority support",
        "Advanced analytics",
      ],
      recommended: true,
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise",
      price: "$299",
      subtitle: "For large organizations",
      billing: "/month",
      features: [
        "Unlimited job posts",
        "Unlimited interviews",
        "Unlimited team members",
        "AI interview analysis",
        "Custom branding",
        "Priority support",
        "Advanced analytics",
        "API access",
        "SSO integration",
      ],
    },
  ];

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !companyData.name ||
      !companyData.displayName ||
      !companyData.industry
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Create company using the auth service
      await createCompany({
        ...companyData,
        subscriptionPlan: selectedPlan,
      });

      // Success - redirect directly to dashboard
      if (onCompanyCreated) {
        onCompanyCreated();
      } else {
        // Redirect to dashboard after a brief success message
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create company. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E293B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C6AD] mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading your account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E293B] py-12 px-4 sm:px-6 lg:px-8">
      <div className={`mx-auto ${step === 2 ? 'max-w-7xl' : 'max-w-2xl'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Complete Your Setup</h1>
          <p className="text-gray-300 mt-2">
            Let&apos;s set up your company profile to get started with Rolevate
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mt-6">
            <div
              className={`flex items-center ${
                step >= 1 ? "text-[#00C6AD]" : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  step >= 1
                    ? "border-[#00C6AD] bg-[#00C6AD] text-white"
                    : "border-gray-600 text-gray-400"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm font-medium">Company Info</span>
            </div>
            <div
              className={`w-16 h-px mx-4 ${
                step >= 2 ? "bg-[#00C6AD]" : "bg-gray-600"
              }`}
            ></div>
            <div
              className={`flex items-center ${
                step >= 2 ? "text-[#00C6AD]" : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  step >= 2
                    ? "border-[#00C6AD] bg-[#00C6AD] text-white"
                    : "border-gray-600 text-gray-400"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm font-medium">Subscription</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-md">
            {error}
          </div>
        )}

        <div className={`rounded-lg shadow-lg border p-8 ${step === 2 ? 'bg-gray-800 border-gray-700' : 'bg-gray-800 border-gray-700'}`}>
          {/* Step 1: Company Information */}
          {step === 1 && (
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Company Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyData.name}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-[#00C6AD] focus:border-[#00C6AD] placeholder-gray-400"
                    placeholder="e.g., TechCorp"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={companyData.displayName}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        displayName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-[#00C6AD] focus:border-[#00C6AD] placeholder-gray-400"
                    placeholder="e.g., TechCorp Solutions"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Industry *
                  </label>
                  <select
                    value={companyData.industry}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        industry: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                    required
                  >
                    <option value="">Select Industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Size
                  </label>
                  <select
                    value={companyData.size}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        size: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-[#00C6AD] focus:border-[#00C6AD]"
                  >
                    {companySizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={companyData.description}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-[#00C6AD] focus:border-[#00C6AD] placeholder-gray-400"
                  rows={3}
                  placeholder="Brief description of your company"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={companyData.website}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        website: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-[#00C6AD] focus:border-[#00C6AD] placeholder-gray-400"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={companyData.location}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-[#00C6AD] focus:border-[#00C6AD] placeholder-gray-400"
                    placeholder="e.g., Dubai, UAE"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={companyData.country}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        country: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-[#00C6AD] focus:border-[#00C6AD] placeholder-gray-400"
                    placeholder="e.g., UAE"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={companyData.city}
                    onChange={(e) =>
                      setCompanyData({
                        ...companyData,
                        city: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-[#00C6AD] focus:border-[#00C6AD] placeholder-gray-400"
                    placeholder="e.g., Dubai"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  className="bg-[#00C6AD] text-white px-6 py-2 rounded-md hover:bg-[#14B8A6] font-medium"
                >
                  Continue to Subscription
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Subscription Plan */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Choose Your Plan
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-[#00C6AD] hover:text-[#14B8A6] text-sm font-medium"
                >
                  ← Back to Company Info
                </button>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Choose Your Plan
                </h2>
                <p className="text-gray-300">
                  Start with our free plan and upgrade as you grow
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`group relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedPlan === plan.id
                        ? "scale-105"
                        : ""
                    }`}
                    onClick={() => setSelectedPlan(plan.id as any)}
                  >
                    {/* Recommended Badge */}
                    {plan.recommended && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="bg-gradient-to-r from-[#00C6AD] to-[#14B8A6] text-white px-4 py-1 text-sm font-semibold rounded-full shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Card */}
                    <div
                      className={`relative rounded-2xl p-6 h-full backdrop-blur-sm transition-all duration-300 min-h-[480px] flex flex-col ${
                        selectedPlan === plan.id
                          ? "bg-gradient-to-br from-[#00C6AD]/20 to-[#14B8A6]/10 border-2 border-[#00C6AD] shadow-2xl shadow-[#00C6AD]/20"
                          : "bg-gradient-to-br from-gray-800/80 to-gray-900/60 border border-gray-600/50 hover:border-gray-500/70 hover:bg-gray-800/90"
                      }`}
                    >
                      {/* Plan Header */}
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-gray-400 text-xs mb-4">
                          {plan.subtitle}
                        </p>
                        
                        <div className="mb-4">
                          {plan.id === "FREE" ? (
                            <div className="text-3xl font-bold text-[#00C6AD]">
                              Free
                            </div>
                          ) : (
                            <div className="flex items-baseline justify-center">
                              <span className="text-3xl font-bold text-white">
                                {plan.price}
                              </span>
                              <span className="text-gray-400 ml-1 text-sm">
                                {plan.billing}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-6 flex-1">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start text-xs"
                          >
                            <div
                              className={`flex-shrink-0 w-4 h-4 rounded-full mr-2 mt-0.5 flex items-center justify-center ${
                                selectedPlan === plan.id
                                  ? "bg-[#00C6AD]"
                                  : "bg-gray-600"
                              }`}
                            >
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className={selectedPlan === plan.id ? "text-gray-200" : "text-gray-300"}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Selection Indicator */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                            selectedPlan === plan.id
                              ? "border-[#00C6AD] bg-[#00C6AD] shadow-lg shadow-[#00C6AD]/50"
                              : "border-gray-500 hover:border-gray-400"
                          }`}
                        >
                          {selectedPlan === plan.id && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto mt-1"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="bg-[#00C6AD] text-white px-6 py-2 rounded-md hover:bg-[#14B8A6] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Company..." : "Complete Setup"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
