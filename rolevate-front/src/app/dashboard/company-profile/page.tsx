"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/common/Button";

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

export default function CompanyProfilePage() {
  const [tab, setTab] = useState("company");
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4005/api/company/me/company', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCompanyProfile(data);
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvitationCode = async () => {
    try {
      setGeneratingInvite(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4005/api/company/${companyProfile?.id}/invitation`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInvitationCode(data.code);
      } else {
        alert('Failed to generate invitation code');
      }
    } catch (error) {
      console.error('Error generating invitation code:', error);
      alert('Error generating invitation code');
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyInvitationLink = () => {
    const inviteLink = `${window.location.origin}/join?code=${invitationCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert('Invitation link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ead9] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!companyProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No company profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header
        title="Company Profile"
        subtitle="Manage your company, users, and subscription."
      />
      <main className="pt-20 px-4 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {companyProfile.logo || companyProfile.name?.charAt(0) || 'C'}
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {companyProfile.name || 'Company Name'}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {companyProfile.description || 'Company description will appear here'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {companyProfile.industry && (
                  <span className="px-4 py-2 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] rounded-full text-sm font-semibold border border-[#13ead9]/20">
                    {companyProfile.industry}
                  </span>
                )}
                {companyProfile.headquarters && (
                  <span className="px-4 py-2 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] rounded-full text-sm font-semibold border border-[#13ead9]/20">
                    {companyProfile.headquarters}
                  </span>
                )}
                {companyProfile.employees && (
                  <span className="px-4 py-2 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] rounded-full text-sm font-semibold border border-[#13ead9]/20">
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
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 text-center"
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
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-6">
          <div className="flex gap-1 p-2">
            <button
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tab === "company"
                  ? "bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
              onClick={() => setTab("company")}
            >
              Company Details
            </button>
            <button
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tab === "users"
                  ? "bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
              onClick={() => setTab("users")}
            >
              Team Members
            </button>
            <button
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tab === "subscription"
                  ? "bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
              onClick={() => setTab("subscription")}
            >
              Subscription
            </button>
            <button
              className={`flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                tab === "security"
                  ? "bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
              onClick={() => setTab("security")}
            >
              Security
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
          {/* Tab Content */}
          {tab === "company" && (
            <div className="space-y-8">
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
                        value={companyProfile.email || ''}
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
                        value={companyProfile.phone || ''}
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
                        value={companyProfile.website || ''}
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
                        value={companyProfile.founded || ''}
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
                        value={companyProfile.mission || ''}
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
                        className="px-4 py-2 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] rounded-full text-sm font-semibold border border-[#13ead9]/20"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Employee Benefits */}
              {companyProfile.benefits && companyProfile.benefits.length > 0 && (
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
                        <div className="w-2 h-2 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full"></div>
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
                  variant="primary" 
                  size="md"
                  onClick={generateInvitationCode}
                  disabled={generatingInvite}
                >
                  {generatingInvite ? 'Generating...' : 'Generate Invite Link'}
                </Button>
              </div>
              
              {invitationCode && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
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
                      className="bg-white/60 rounded-2xl p-6 shadow-lg border border-white/20"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md">
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
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white rounded-full text-sm font-semibold shadow-md">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-4">No team members yet</p>
                  <p className="text-sm text-gray-400">Generate an invitation link to add your first team member</p>
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
                  <div className="bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-2xl p-8 text-white text-center shadow-2xl">
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
                  <div className="bg-gray-100 rounded-2xl p-8 text-center">
                    <p className="text-gray-600">No subscription information available</p>
                  </div>
                )}
              </div>

              <div className="max-w-2xl mx-auto">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Plan Features
                </h4>
                {companyProfile.subscription?.features && companyProfile.subscription.features.length > 0 ? (
                  <div className="space-y-3">
                    {companyProfile.subscription.features.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-gray-100"
                      >
                        <div className="w-5 h-5 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full flex items-center justify-center">
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
                  <p className="text-gray-500 text-center">No features listed</p>
                )}
              </div>

              <div className="text-center">
                <Button variant="primary" size="lg">
                  Upgrade Plan
                </Button>
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
                <div className="bg-white/60 rounded-2xl p-8 shadow-lg border border-white/20">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    Change Password
                  </h4>
                  
                  <form className="space-y-6" onSubmit={(e) => {
                    e.preventDefault();
                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                      alert('New passwords do not match');
                      return;
                    }
                    if (passwordData.newPassword.length < 8) {
                      alert('Password must be at least 8 characters long');
                      return;
                    }
                    alert('Password changed successfully!');
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        >
                          {showPasswords.current ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
                          placeholder="Enter new password"
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        >
                          {showPasswords.new ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        >
                          {showPasswords.confirm ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="md"
                        className="flex-1"
                      >
                        Update Password
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary" 
                        size="md"
                        className="flex-1"
                        onClick={() => {
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
