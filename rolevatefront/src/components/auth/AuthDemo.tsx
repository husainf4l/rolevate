"use client";

import React, { useState } from "react";
import {
  login,
  register,
  logout,
  getCurrentUser,
  changePassword,
  getCompany,
  getSubscriptionStatus,
  getSubscriptionLimits,
  upgradeSubscription,
  LoginCredentials,
  RegisterCredentials,
  ChangePasswordRequest,
  User,
  Company,
  SubscriptionStatus,
  SubscriptionLimits,
  AuthError,
} from "../../services/auth.service";

export default function AuthDemo() {
  const [activeTab, setActiveTab] = useState("login");
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Login form state
  const [loginData, setLoginData] = useState<LoginCredentials>({
    emailOrUsername: "",
    password: "",
  });

  // Registration form state
  const [registerData, setRegisterData] = useState<RegisterCredentials>({
    email: "",
    username: "",
    password: "",
    name: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: "RECRUITER",
    createCompany: false,
    companyData: {
      name: "",
      displayName: "",
      industry: "",
      description: "",
      website: "",
      location: "",
      country: "",
      city: "",
      size: "MEDIUM",
      subscriptionPlan: "BASIC",
    },
  });

  // Password change form state
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
  });

  const handleError = (err: unknown) => {
    if (err instanceof AuthError) {
      setError(`Error (${err.status}): ${err.message}`);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("An unknown error occurred");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const userData = await login(loginData);
      setUser(userData);
      setMessage("Login successful!");
      setActiveTab("profile");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const userData = await register(registerData);
      setUser(userData);
      setMessage("Registration successful! You are now logged in.");
      setActiveTab("profile");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setCompany(null);
      setSubscription(null);
      setLimits(null);
      setMessage("Logged out successfully");
      setActiveTab("login");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setMessage("Profile fetched successfully");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCompany = async () => {
    setLoading(true);
    setError("");
    try {
      const companyData = await getCompany();
      setCompany(companyData);
      setMessage("Company data fetched successfully");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSubscription = async () => {
    setLoading(true);
    setError("");
    try {
      const subscriptionData = await getSubscriptionStatus();
      setSubscription(subscriptionData);
      setMessage("Subscription status fetched successfully");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetLimits = async () => {
    setLoading(true);
    setError("");
    try {
      const limitsData = await getSubscriptionLimits();
      setLimits(limitsData);
      setMessage("Subscription limits fetched successfully");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await changePassword(passwordData);
      setMessage(result.message);
      setPasswordData({ currentPassword: "", newPassword: "" });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSubscription = async (plan: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await upgradeSubscription(plan);
      setMessage(result.message);
      // Refresh subscription status
      await handleGetSubscription();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">
        Rolevate Auth Demo
      </h1>

      {/* Status Messages */}
      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          {["login", "register", "profile", "company", "subscription"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "login" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email or Username
              </label>
              <input
                type="text"
                value={loginData.emailOrUsername}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    emailOrUsername: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter email or username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "register" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Register</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={registerData.username}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      username: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  value={registerData.firstName}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      firstName: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  value={registerData.lastName}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      lastName: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={registerData.phoneNumber}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="+971501234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={registerData.role}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      role: e.target.value as any,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="RECRUITER">Recruiter</option>
                  <option value="HR_MANAGER">HR Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Secure password"
              />
            </div>

            <div className="border p-4 rounded-md bg-gray-50">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={registerData.createCompany}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      createCompany: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Create new company
                </span>
              </label>

              {registerData.createCompany && registerData.companyData && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={registerData.companyData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            companyData: {
                              ...registerData.companyData!,
                              name: e.target.value,
                            },
                          })
                        }
                        className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="TechCorp"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={registerData.companyData.displayName}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            companyData: {
                              ...registerData.companyData!,
                              displayName: e.target.value,
                            },
                          })
                        }
                        className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="TechCorp Solutions"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={registerData.companyData.industry}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          companyData: {
                            ...registerData.companyData!,
                            industry: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Technology"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Profile</h2>
            <div className="space-x-2">
              <button
                onClick={handleGetProfile}
                disabled={loading}
                className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Refresh Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Logout
              </button>
            </div>
          </div>

          {user && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">User Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>ID:</strong> {user.id}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Username:</strong> {user.username}
                </div>
                <div>
                  <strong>Name:</strong> {user.name}
                </div>
                <div>
                  <strong>Role:</strong> {user.role}
                </div>
                <div>
                  <strong>Company ID:</strong> {user.companyId || "None"}
                </div>
                <div>
                  <strong>Active:</strong> {user.isActive ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Last Login:</strong> {user.lastLoginAt || "Never"}
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "company" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Company</h2>
            <button
              onClick={handleGetCompany}
              disabled={loading}
              className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Load Company Data
            </button>
          </div>

          {company && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Company Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>ID:</strong> {company.id}
                </div>
                <div>
                  <strong>Name:</strong> {company.name}
                </div>
                <div>
                  <strong>Display Name:</strong> {company.displayName}
                </div>
                <div>
                  <strong>Industry:</strong> {company.industry}
                </div>
                <div>
                  <strong>Subscription Plan:</strong>{" "}
                  {company.subscription.plan}
                </div>
                <div>
                  <strong>Subscription Status:</strong>{" "}
                  {company.subscription.status}
                </div>
                <div>
                  <strong>Subscription End:</strong>{" "}
                  {company.subscription.endDate}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "subscription" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subscription</h2>
            <div className="space-x-2">
              <button
                onClick={handleGetSubscription}
                disabled={loading}
                className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Load Status
              </button>
              <button
                onClick={handleGetLimits}
                disabled={loading}
                className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Load Limits
              </button>
            </div>
          </div>

          {subscription && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Subscription Status</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Plan:</strong> {subscription.plan}
                </div>
                <div>
                  <strong>Status:</strong> {subscription.status}
                </div>
                <div>
                  <strong>End Date:</strong> {subscription.endDate}
                </div>
                <div>
                  <strong>Features:</strong> {subscription.features.join(", ")}
                </div>
              </div>
            </div>
          )}

          {limits && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Usage Limits</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Job Posts:</span>
                  <span>
                    {limits.jobPosts.used} / {limits.jobPosts.limit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interviews:</span>
                  <span>
                    {limits.interviews.used} / {limits.interviews.limit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Users:</span>
                  <span>
                    {limits.users.used} / {limits.users.limit}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Upgrade Subscription</h3>
            <div className="space-x-2">
              <button
                onClick={() => handleUpgradeSubscription("PREMIUM")}
                disabled={loading}
                className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Upgrade to Premium
              </button>
              <button
                onClick={() => handleUpgradeSubscription("ENTERPRISE")}
                disabled={loading}
                className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 disabled:opacity-50"
              >
                Upgrade to Enterprise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
