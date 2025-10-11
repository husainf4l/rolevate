"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/common/logo";
import {
  CreateCompanyForm,
  JoinCompanyForm,
  SetupIllustration,
  CompanyData,
} from "@/components/setup-company";
import { ConfigurationService } from "@/services/configuration";

export default function SetupCompanyPage() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  // Page fade-in effect
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Company create state
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    industry: "",
    size: "",
    website: "",
    email: "",
    description: "",
    country: "",
    city: "",
    street: "",
    phone: "",
  });
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  // Join code
  const [invitationCode, setInvitationCode] = useState("");

  // AI Description
  const generateDescription = async () => {
    setIsGeneratingDescription(true);
    setDescriptionError(null);
    try {
      const response = await ConfigurationService.generateCompanyDescription({
        industry: companyData.industry,
        location: companyData.city,
        country: companyData.country,
        numberOfEmployees: Number(companyData.size.split("-")[0]) || 0,
        currentDescription: companyData.description,
        website: companyData.website,
      });
      setCompanyData((prev) => ({
        ...prev,
        description: response.generatedDescription,
      }));
    } catch (error: any) {
      setDescriptionError(error.message || "Failed to generate description");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Handlers
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await ConfigurationService.createCompany(companyData);
      router.replace("/dashboard");
    } catch (error: any) {
      setError(error.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await ConfigurationService.joinCompany({ invitationCode });
      router.replace("/dashboard");
    } catch (error: any) {
      setError(error.message || "Failed to join company");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Setting up your workspace...</p>
        </div>
      </div>
    );

  return (
    <section className="w-full min-h-screen bg-white">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-white border-b border-gray-200">
          <Logo size={32} />
          <button
            onClick={() => router.push("/login")}
            className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm transition-colors"
          >
            <span className="font-medium">Back</span>
          </button>
        </div>
        {/* Main Form */}
        <div className="flex flex-col justify-center lg:col-span-8 px-4 sm:px-8 pt-20 pb-8 min-h-screen">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="text-center mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Company Setup
              </h1>
              <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Create your company profile or join an existing organization to
                get started.
              </p>
            </div>
            <div className="relative bg-gray-100 rounded-lg p-1 mb-8 w-1/2 max-w-5xl mx-auto border border-gray-200">
              <div className="flex relative">
                {/* Sliding Background */}
                <div
                  className={`absolute top-0 bottom-0 w-1/2 bg-primary-600 rounded-md shadow-sm transition-all duration-300 ease-out ${
                    activeTab === "create" ? "left-0" : "left-1/2"
                  }`}
                />

                <button
                  onClick={() => setActiveTab("create")}
                  className={`relative flex-1 py-3.5 px-4 rounded-md font-semibold text-sm transition-all duration-300 ease-out ${
                    activeTab === "create"
                      ? "text-white scale-[1.02] shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:scale-[1.01]"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg
                      className={`w-4 h-4 transition-all duration-300 ${
                        activeTab === "create" ? "text-white" : "text-gray-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Company
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("join")}
                  className={`relative flex-1 py-3.5 px-4 rounded-md font-semibold text-sm transition-all duration-300 ease-out ${
                    activeTab === "join"
                      ? "text-white scale-[1.02] shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:scale-[1.01]"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg
                      className={`w-4 h-4 transition-all duration-300 ${
                        activeTab === "join" ? "text-white" : "text-gray-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Join Company
                  </span>
                </button>
              </div>
            </div>
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
            {activeTab === "create" ? (
              <CreateCompanyForm
                loading={loading}
                companyData={companyData}
                setCompanyData={setCompanyData}
                onSubmit={handleCreateCompany}
                isGeneratingDescription={isGeneratingDescription}
                generateDescription={generateDescription}
                descriptionError={descriptionError}
              />
            ) : (
              <JoinCompanyForm
                loading={loading}
                invitationCode={invitationCode}
                setInvitationCode={setInvitationCode}
                onSubmit={handleJoinCompany}
              />
            )}
          </div>
        </div>
        <SetupIllustration />
      </div>
    </section>
  );
}

