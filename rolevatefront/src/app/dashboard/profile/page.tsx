"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Company,
  ChangePasswordRequest,
  changePassword,
  getCompany,
  getSubscriptionStatus,
  SubscriptionStatus,
} from "@/services/auth.service";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("profile");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [companyData, subscriptionData] = await Promise.all([
          getCompany().catch(() => null),
          getSubscriptionStatus().catch(() => null),
        ]);

        setCompany(companyData);
        setSubscription(subscriptionData);
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadProfileData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Reset form and show success
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage("Password changed successfully");
    } catch (error) {
      setErrorMessage(
        "Failed to change password. Please ensure your current password is correct."
      );
      console.error("Password change error:", error);
    } finally {
      setChangingPassword(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
          Authentication Error
        </h3>
        <p className="mt-2 text-red-700 dark:text-red-400">
          You need to be logged in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Profile
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your account information and settings
          </p>
        </div>

        {/* Success and error messages */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-300">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Profile tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab("company")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "company"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Company
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "security"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                      {user.username}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                      {user.firstName || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                      {user.lastName || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                      {user.phoneNumber || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Member Since
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Login
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleString()
                          : "Not available"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Tab */}
          {activeTab === "company" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Company Information
                  </h2>

                  {company ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Company Name
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Display Name
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                          {company.displayName || "Not set"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Industry
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                          {company.industry || "Not specified"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Company ID
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white font-mono text-sm">
                          {company.id}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400 mb-4">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🏢</span>
                        </div>
                        <p className="text-lg font-medium">
                          No company information available
                        </p>
                        <p className="text-sm mt-1">
                          You need to set up your company to access all features
                        </p>
                      </div>
                      <div className="space-y-3">
                        <a
                          href="/company-setup"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <span className="mr-2">🏢</span>
                          Set Up Company
                        </a>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Create your company profile and choose a subscription
                          plan
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription Information */}
              {subscription && (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Subscription Details
                      </h2>
                      <Link href="/dashboard/subscription">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md inline-flex items-center">
                          <span>Manage Subscription</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Plan
                        </label>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {subscription.plan}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </label>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subscription.status === "ACTIVE"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {subscription.status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Date
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white">
                          {new Date(subscription.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {subscription.features &&
                      subscription.features.length > 0 && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Features
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {subscription.features.map((feature, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Change Password
                </h2>
                <form
                  onSubmit={handlePasswordChange}
                  className="max-w-md space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-blue-500 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword
                        ? "Changing Password..."
                        : "Change Password"}
                    </button>
                  </div>
                </form>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Security Tips
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>Use a strong password with at least 8 characters</li>
                    <li>
                      Include numbers, symbols, and both uppercase and lowercase
                      letters
                    </li>
                    <li>Don't reuse passwords from other websites</li>
                    <li>
                      Consider using a password manager for better security
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
