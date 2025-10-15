"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { CameraIcon } from "@heroicons/react/24/outline";
import { API_CONFIG } from "@/lib/config";
import toast from "react-hot-toast";

interface CompanyUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface CompanyProfile {
  id?: number;
  name?: string;
  logo?: string;
  industry?: string;
  founded?: string;
  employees?: string;
  headquarters?: string;
  website?: string;
  description?: string;
  mission?: string;
  email?: string;
  phone?: string;
  values?: string[];
  benefits?: string[];
  stats?: { label: string; value: string }[];
  subscription?: {
    plan: string;
    renewal: string;
    status: string;
    features: string[];
  };
  users?: CompanyUser[];
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  systemAlerts: boolean;
  weeklyReports: boolean;
}

export default function CompanyProfilePage() {
  const [tab, setTab] = useState("company");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      applicationUpdates: true,
      interviewReminders: true,
      systemAlerts: true,
      weeklyReports: false,
    });



  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.API_BASE_URL}/company/me/company`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCompanyProfile(data);
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateInvitationCode = useCallback(async () => {
    if (!companyProfile?.id) return;
    
    try {
      setGeneratingInvite(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.API_BASE_URL}/company/${companyProfile.id}/invitation`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setInvitationCode(data.code);
      } else {
        toast.error("Failed to generate invitation code");
      }
    } catch (error) {
      console.error("Error generating invitation code:", error);
      toast.error("Error generating invitation code");
    } finally {
      setGeneratingInvite(false);
    }
  }, [companyProfile?.id]);

  const copyInvitationLink = useCallback(async () => {
    if (!invitationCode) return;
    
    try {
      const inviteLink = `${window.location.origin}/join?code=${invitationCode}`;
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invitation link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy link. Please try again.");
    }
  }, [invitationCode]);

  const saveNotificationSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.API_BASE_URL}/company/notifications`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationSettings),
        }
      );

      if (response.ok) {
        toast.success("Notification settings saved successfully!");
      } else {
        throw new Error("Failed to save notification settings");
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification settings");
    }
  }, [notificationSettings]);

  const handleLogoUpload = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);

    try {
      setLoading(true);

      const response = await fetch(
        `${API_CONFIG.API_BASE_URL}/company/upload-logo`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCompanyProfile((prev) =>
          prev ? { ...prev, logo: data.logoUrl } : null
        );
        toast.success("Company logo updated successfully!");
      } else {
        throw new Error("Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!companyProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No company profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-primary-50">
      <Header
        title="Company Profile"
        subtitle="Manage your company, users, and subscription."
      />
      <main className="pt-20 px-4 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-sm shadow-2xl p-8 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-24 h-24 bg-primary-600 rounded-sm flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden">
                  {companyProfile.logo ? (
                    <Image
                      src={companyProfile.logo}
                      alt="Company Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-sm"
                      onError={() => {
                        console.error(
                          "Image failed to load:",
                          companyProfile.logo
                        );
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully!");
                      }}
                    />
                  ) : (
                    companyProfile.name?.charAt(0) || "C"
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-white">
                  <CameraIcon className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {companyProfile.name || "Company Name"}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {companyProfile.description ||
                  "Company description will appear here"}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {companyProfile.industry && (
                  <span className="px-4 py-2 bg-primary-600/10 text-primary-600 rounded-full text-sm font-semibold border border-primary-600/20">
                    {companyProfile.industry}
                  </span>
                )}
                {companyProfile.headquarters && (
                  <span className="px-4 py-2 bg-primary-600/10 text-primary-600 rounded-full text-sm font-semibold border border-primary-600/20">
                    {companyProfile.headquarters}
                  </span>
                )}
                {companyProfile.employees && (
                  <span className="px-4 py-2 bg-primary-600/10 text-primary-600 rounded-full text-sm font-semibold border border-primary-600/20">
                    {companyProfile.employees} employees
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {companyProfile.stats && companyProfile.stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {companyProfile.stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-xl rounded-sm p-6 shadow-xl border border-white/20 text-center"
              >
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-sm shadow-xl border border-white/20 mb-6">
          <div className="flex gap-1 p-2">
            <button
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tab === "company"
                  ? "bg-primary-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
              onClick={() => setTab("company")}
            >
              Company Details
            </button>
            <button
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tab === "users"
                  ? "bg-primary-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
              onClick={() => setTab("users")}
            >
              Team Members
            </button>
            <button
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tab === "subscription"
                  ? "bg-primary-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
              onClick={() => setTab("subscription")}
            >
              Subscription
            </button>
            <button
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tab === "notifications"
                  ? "bg-primary-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
              onClick={() => setTab("notifications")}
            >
              Notifications
            </button>
            <button
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tab === "security"
                  ? "bg-primary-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
              onClick={() => setTab("security")}
            >
              Security
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-sm shadow-xl p-8 border border-white/20">
          {/* Tab Content */}
          {tab === "company" && (
            <div className="space-y-8">
              {/* Company Logo Section */}
              <div className="bg-gray-50 rounded-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Company Logo
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-primary-600 rounded-sm flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden">
                      {companyProfile.logo ? (
                        <Image
                          src={companyProfile.logo}
                          alt="Company Logo"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-sm"
                          onError={() => {
                            console.error(
                              "Logo section image failed to load:",
                              companyProfile.logo
                            );
                          }}
                          onLoad={() => {
                            console.log(
                              "Logo section image loaded successfully!"
                            );
                          }}
                        />
                      ) : (
                        companyProfile.name?.charAt(0) || "C"
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
                      <CameraIcon className="w-3 h-3 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Update Company Logo
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload a square image for best results. Recommended size:
                      200x200px. Max file size: 5MB.
                    </p>
                    <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                    {loading && (
                      <div className="mt-2 flex items-center text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={companyProfile.email || ""}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none"
                        placeholder="No email provided"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={companyProfile.phone || ""}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none"
                        placeholder="No phone provided"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={companyProfile.website || ""}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none"
                        placeholder="No website provided"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Company Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Founded
                      </label>
                      <input
                        type="text"
                        value={companyProfile.founded || ""}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none"
                        placeholder="No founding date provided"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mission
                      </label>
                      <textarea
                        value={companyProfile.mission || ""}
                        disabled
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none resize-none"
                        placeholder="No mission statement provided"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Values */}
              {companyProfile.values && companyProfile.values.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Our Values
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {companyProfile.values.map((value, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-primary-600/10 text-primary-600 rounded-full text-sm font-semibold border border-primary-600/20"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Employee Benefits */}
              {companyProfile.benefits &&
                companyProfile.benefits.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Employee Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companyProfile.benefits.map((benefit, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-gray-100"
                        >
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          <span className="text-gray-800 font-medium">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Team Members
                </h3>
                <Button
                  variant="default"
                  size="default"
                  onClick={generateInvitationCode}
                  disabled={generatingInvite}
                >
                  {generatingInvite ? "Generating..." : "Generate Invite Link"}
                </Button>
              </div>

              {invitationCode && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-sm p-6 mb-6">
                  <h4 className="text-lg font-bold text-green-800 mb-3">
                    Invitation Link Generated!
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-green-200">
                    <code className="flex-1 text-sm text-gray-700 break-all">
                      {window.location.origin}/join?code={invitationCode}
                    </code>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={copyInvitationLink}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Share this link with new team members to join your company.
                  </p>
                </div>
              )}
              {companyProfile.users && companyProfile.users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {companyProfile.users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white/60 rounded-sm p-6 shadow-lg border border-white/20"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {user.name}
                          </h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="inline-block px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-semibold shadow-md">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">No team members yet</p>
                  <p className="text-sm text-gray-400">
                    Generate an invitation link to add your first team member
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "subscription" && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Current Subscription
                </h3>
                <p className="text-gray-600">
                  Manage your subscription plan and features
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                {companyProfile.subscription ? (
                  <div className="bg-primary-600 rounded-sm p-8 text-white text-center shadow-2xl">
                    <div className="text-3xl font-bold mb-2">
                      {companyProfile.subscription.plan} Plan
                    </div>
                    <div className="text-lg opacity-90 mb-4">
                      Active until {companyProfile.subscription.renewal}
                    </div>
                    <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                      {companyProfile.subscription.status}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-sm p-8 text-center">
                    <p className="text-gray-600">
                      No subscription information available
                    </p>
                  </div>
                )}
              </div>

              <div className="max-w-2xl mx-auto">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Plan Features
                </h4>
                {companyProfile.subscription?.features &&
                companyProfile.subscription.features.length > 0 ? (
                  <div className="space-y-3">
                    {companyProfile.subscription.features.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-gray-100"
                      >
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-800 font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">
                    No features listed
                  </p>
                )}
              </div>

              <div className="text-center">
                <Button variant="default" size="lg">
                  Upgrade Plan
                </Button>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Notification Preferences
                </h3>
                <p className="text-gray-600">
                  Choose how you want to be notified about important events
                </p>
              </div>

              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white/60 rounded-sm p-8 shadow-lg border border-white/20">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    General Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          Email Notifications
                        </h5>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          SMS Notifications
                        </h5>
                        <p className="text-sm text-gray-500">
                          Receive notifications via SMS
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              smsNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          Push Notifications
                        </h5>
                        <p className="text-sm text-gray-500">
                          Receive push notifications in browser
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              pushNotifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 rounded-sm p-8 shadow-lg border border-white/20">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    Activity Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          Application Updates
                        </h5>
                        <p className="text-sm text-gray-500">
                          New applications and status changes
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.applicationUpdates}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              applicationUpdates: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          Interview Reminders
                        </h5>
                        <p className="text-sm text-gray-500">
                          Upcoming interview notifications
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.interviewReminders}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              interviewReminders: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          System Alerts
                        </h5>
                        <p className="text-sm text-gray-500">
                          Important system updates and maintenance
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.systemAlerts}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              systemAlerts: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          Weekly Reports
                        </h5>
                        <p className="text-sm text-gray-500">
                          Weekly activity and analytics reports
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.weeklyReports}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              weeklyReports: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={saveNotificationSettings}
                  >
                    Save Notification Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Security Settings
                </h3>
                <p className="text-gray-600">
                  Update your password and security preferences
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="bg-white/60 rounded-sm p-8 shadow-lg border border-white/20">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    Change Password
                  </h4>

                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (
                        passwordData.newPassword !==
                        passwordData.confirmPassword
                      ) {
                        toast.error("New passwords do not match");
                        return;
                      }
                      if (passwordData.newPassword.length < 8) {
                        toast.error("Password must be at least 8 characters long");
                        return;
                      }
                      toast.success("Password changed successfully!");
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                        >
                          {showPasswords.current ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          placeholder="Enter new password"
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                        >
                          {showPasswords.new ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                        >
                          {showPasswords.confirm ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      {passwordData.confirmPassword &&
                        passwordData.newPassword !==
                          passwordData.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">
                            Passwords do not match
                          </p>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        variant="default"
                        size="default"
                        className="flex-1"
                      >
                        Update Password
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="default"
                        className="flex-1"
                        onClick={() => {
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

