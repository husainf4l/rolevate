"use client";

import React, { useState } from "react";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/common/Button";

const companyProfile = {
  name: "Tech Corp Ltd",
  logo: "TC",
  industry: "Technology",
  founded: "2012",
  employees: "120+",
  headquarters: "Amman, Jordan",
  website: "https://techcorp.com",
  description:
    "Tech Corp Ltd is a leading technology company in Jordan, delivering innovative digital solutions and products for clients across the region.",
  mission:
    "Empowering businesses and communities through technology and digital transformation.",
  values: [
    "Customer First",
    "Innovation & Excellence",
    "Integrity & Trust",
    "Community Impact",
    "Sustainability",
  ],
  benefits: [
    "Comprehensive Health Insurance",
    "Annual Performance Bonuses",
    "Professional Development Programs",
    "Flexible Working Hours",
    "Employee Discount on Services",
    "Paid Training & Certifications",
    "Career Growth Opportunities",
    "Modern Office Environment",
  ],
  stats: [
    { label: "Active Clients", value: "200+" },
    { label: "Years in Business", value: "12+" },
    { label: "Projects Delivered", value: "350+" },
    { label: "Employee Satisfaction", value: "4.7/5" },
  ],
  subscription: {
    plan: "Pro",
    renewal: "2025-12-31",
    status: "Active",
    features: [
      "Unlimited Job Postings",
      "Advanced Analytics",
      "Priority Support",
      "Branded Company Page",
      "Featured Listings",
    ],
  },
  users: [
    {
      id: 1,
      name: "Amina Al-Farsi",
      email: "amina@techcorp.com",
      role: "Admin",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: 2,
      name: "Omar Khaled",
      email: "omar@techcorp.com",
      role: "Recruiter",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      name: "Layla Nasser",
      email: "layla@techcorp.com",
      role: "Hiring Manager",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  ],
};

export default function CompanyProfilePage() {
  const [tab, setTab] = useState("company");

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
                {companyProfile.logo}
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {companyProfile.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {companyProfile.description}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <span className="px-4 py-2 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] rounded-full text-sm font-semibold border border-[#13ead9]/20">
                  {companyProfile.industry}
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] rounded-full text-sm font-semibold border border-[#13ead9]/20">
                  {companyProfile.headquarters}
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 text-[#0891b2] rounded-full text-sm font-semibold border border-[#13ead9]/20">
                  {companyProfile.employees} employees
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
                        value="hr@techcorp.com"
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value="+962 7 9999 9999"
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={companyProfile.website}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none"
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
                        value={companyProfile.founded}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mission
                      </label>
                      <textarea
                        value={companyProfile.mission}
                        disabled
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Values */}
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

              {/* Employee Benefits */}
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
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Team Members
                </h3>
                <Button variant="primary" size="md">
                  Add New User
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {companyProfile.users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/60 rounded-2xl p-6 shadow-lg border border-white/20"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                      />
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
              </div>

              <div className="max-w-2xl mx-auto">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Plan Features
                </h4>
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
              </div>

              <div className="text-center">
                <Button variant="primary" size="lg">
                  Upgrade Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
