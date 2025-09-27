"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Logo from "@/components/common/logo";
import {
  CreateCompanyForm,
  JoinCompanyForm,
  SetupIllustration,
} from "@/components/setup-company";
// import { ConfigurationService, CompanyData } from "@/services/configuration";
// import { type CompanyData } from "@/services/configuration";

export default function SetupCompanyPage() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  // const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('setupCompany');
  const locale = useLocale();

  // Page fade-in effect
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Company create state
  /*
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
  */
  // const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  // const [descriptionError, setDescriptionError] = useState<string | null>(null);
  // Join code
  // const [invitationCode, setInvitationCode] = useState("");

  // AI Description
  /*
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
    } catch (error: unknown) {
      setDescriptionError(error instanceof Error ? error.message : "Failed to generate description");
    } finally {
      setIsGeneratingDescription(false);
    }
  };
  */

  // Handlers
  /*
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await ConfigurationService.createCompany(companyData);
      router.replace("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create company");
    } finally {
      setLoading(false);
    }
  };
  */

  /*
  const handleJoinCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await ConfigurationService.joinCompany({ invitationCode });
      router.replace("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to join company");
    } finally {
      setLoading(false);
    }
  };
  */

  if (pageLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">{t('loading')}</p>
        </div>
      </div>
    );

  return (
    <section className="w-full min-h-screen bg-background">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen relative">
        {/* Header */}
        <div className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-background/95 backdrop-blur-lg border-b border-border ${
          locale === 'ar' ? 'flex-row-reverse' : ''
        }`}>
          <Logo />
          <button
            onClick={() => router.push("/login")}
            className="flex items-center text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/80 text-sm transition-colors"
          >
            <span className="font-medium">{t('back')}</span>
          </button>
        </div>
        {/* Main Form */}
        <div className="flex flex-col justify-center lg:col-span-8 px-4 sm:px-8 pt-20 pb-8 min-h-screen">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className={`text-center mb-6 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {t('title')}
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t('subtitle')}
              </p>
            </div>
            <div className="relative bg-muted rounded-2xl p-1.5 mb-8 w-1/2 max-w-5xl mx-auto shadow-sm border backdrop-blur-sm">
              <div className="flex relative">
                {/* Sliding Background */}
                <div
                  className={`absolute top-0 bottom-0 w-1/2 bg-primary rounded-xl shadow-lg transition-all duration-300 ease-out ${
                    activeTab === "create" ? "left-0" : "left-1/2"
                  }`}
                />

                <button
                  onClick={() => setActiveTab("create")}
                  className={`relative flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-out ${
                    activeTab === "create"
                      ? "text-primary-foreground scale-[1.02] shadow-sm"
                      : "text-foreground hover:text-foreground hover:scale-[1.01]"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg
                      className={`w-4 h-4 transition-all duration-300 ${
                        activeTab === "create" ? "text-primary-foreground" : "text-muted-foreground"
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
                    {t('tabs.create')}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("join")}
                  className={`relative flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ease-out ${
                    activeTab === "join"
                      ? "text-primary-foreground scale-[1.02] shadow-sm"
                      : "text-foreground hover:text-foreground hover:scale-[1.01]"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg
                      className={`w-4 h-4 transition-all duration-300 ${
                        activeTab === "join" ? "text-primary-foreground" : "text-muted-foreground"
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
                    {t('tabs.join')}
                  </span>
                </button>
              </div>
            </div>
            {error && (
              <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
                {error}
              </div>
            )}
            {activeTab === "create" ? (
              <CreateCompanyForm />
            ) : (
              <JoinCompanyForm />
            )}
          </div>
        </div>
        <SetupIllustration />
      </div>
    </section>
  );
}
