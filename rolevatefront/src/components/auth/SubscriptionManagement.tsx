"use client";

import React, { useState, useEffect } from "react";
import {
  getSubscriptionStatus,
  getSubscriptionLimits,
  upgradeSubscription,
  SubscriptionStatus,
  SubscriptionLimits,
  AuthError,
} from "../../services/auth.service";

interface PlanFeature {
  name: string;
  free: boolean | string;
  basic: boolean | string;
  premium: boolean | string;
  enterprise: boolean | string;
}

const planFeatures: PlanFeature[] = [
  {
    name: "Job Posts",
    free: "3/month",
    basic: "10/month",
    premium: "50/month",
    enterprise: "Unlimited",
  },
  {
    name: "Active Interviews",
    free: "2",
    basic: "5",
    premium: "25",
    enterprise: "Unlimited",
  },
  {
    name: "Team Members",
    free: "1",
    basic: "3",
    premium: "15",
    enterprise: "Unlimited",
  },
  {
    name: "AI Interview Analysis",
    free: "Basic",
    basic: true,
    premium: true,
    enterprise: true,
  },
  {
    name: "Custom Branding",
    free: false,
    basic: false,
    premium: true,
    enterprise: true,
  },
  {
    name: "Priority Support",
    free: false,
    basic: false,
    premium: true,
    enterprise: true,
  },
  {
    name: "Advanced Analytics",
    free: false,
    basic: false,
    premium: false,
    enterprise: true,
  },
  {
    name: "API Access",
    free: false,
    basic: false,
    premium: false,
    enterprise: true,
  },
  {
    name: "SSO Integration",
    free: false,
    basic: false,
    premium: false,
    enterprise: true,
  },
];

const planPrices = {
  FREE: { monthly: 0, yearly: 0 },
  BASIC: { monthly: 29, yearly: 290 },
  PREMIUM: { monthly: 99, yearly: 990 },
  ENTERPRISE: { monthly: 299, yearly: 2990 },
};

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subscriptionData, limitsData] = await Promise.allSettled([
        getSubscriptionStatus(),
        getSubscriptionLimits(),
      ]);

      if (subscriptionData.status === "fulfilled") {
        setSubscription(subscriptionData.value);
      }
      if (limitsData.status === "fulfilled") {
        setLimits(limitsData.value);
      }
    } catch (err) {
      setError("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    try {
      setUpgrading(plan);
      setError("");
      setSuccess("");

      await upgradeSubscription(plan);
      setSuccess(`Successfully upgraded to ${plan} plan!`);

      // Reload subscription data
      await loadSubscriptionData();
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("Failed to upgrade subscription");
      }
    } finally {
      setUpgrading(null);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-teal-600 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Status Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            {success}
          </div>
        )}

        {/* Current Subscription Status */}
        {subscription && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Current Subscription
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription.plan}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    subscription.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {subscription.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Renewal Date
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Limits */}
        {limits && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Usage Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Job Posts
                  </h3>
                  <span className="text-sm text-gray-500">
                    {limits.jobPosts.used} /{" "}
                    {limits.jobPosts.limit === -1 ? "∞" : limits.jobPosts.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      getUsagePercentage(
                        limits.jobPosts.used,
                        limits.jobPosts.limit
                      )
                    )}`}
                    style={{
                      width: `${getUsagePercentage(
                        limits.jobPosts.used,
                        limits.jobPosts.limit
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Interviews
                  </h3>
                  <span className="text-sm text-gray-500">
                    {limits.interviews.used} /{" "}
                    {limits.interviews.limit === -1
                      ? "∞"
                      : limits.interviews.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      getUsagePercentage(
                        limits.interviews.used,
                        limits.interviews.limit
                      )
                    )}`}
                    style={{
                      width: `${getUsagePercentage(
                        limits.interviews.used,
                        limits.interviews.limit
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Team Members
                  </h3>
                  <span className="text-sm text-gray-500">
                    {limits.users.used} /{" "}
                    {limits.users.limit === -1 ? "∞" : limits.users.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getUsageColor(
                      getUsagePercentage(limits.users.used, limits.users.limit)
                    )}`}
                    style={{
                      width: `${getUsagePercentage(
                        limits.users.used,
                        limits.users.limit
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200/50 p-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Upgrade your subscription to unlock more features and scale your
              recruitment
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mt-8">
              <span
                className={`text-sm font-medium transition-colors ${
                  billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Monthly
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly"
                  )
                }
                className="relative inline-flex h-7 w-12 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 mx-4 hover:bg-gray-300"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                    billingCycle === "yearly"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium transition-colors ${
                  billingCycle === "yearly" ? "text-gray-900" : "text-gray-500"
                }`}
              >
                Yearly
                <span className="ml-2 text-green-600 font-semibold text-xs bg-green-100 px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {(["FREE", "BASIC", "PREMIUM", "ENTERPRISE"] as const).map(
              (plan) => (
                <div
                  key={plan}
                  className={`group relative rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    subscription?.plan === plan
                      ? "scale-105 ring-2 ring-teal-500 shadow-2xl shadow-teal-500/25"
                      : ""
                  } ${plan === "PREMIUM" ? "lg:scale-110 lg:z-10" : ""}`}
                >
                  {plan === "PREMIUM" && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                      <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 text-sm font-bold rounded-full shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div
                    className={`relative h-full rounded-2xl p-8 backdrop-blur-sm ${
                      subscription?.plan === plan
                        ? "bg-gradient-to-br from-teal-50 to-teal-100/50 border-2 border-teal-300"
                        : plan === "PREMIUM"
                        ? "bg-gradient-to-br from-white to-gray-50 border-2 border-teal-200 shadow-xl"
                        : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg"
                    } transition-all duration-300`}
                  >
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.charAt(0) + plan.slice(1).toLowerCase()}
                      </h3>

                      <div className="mb-6">
                        {plan === "FREE" ? (
                          <div className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                            Free
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-center">
                            <span className="text-5xl font-bold text-gray-900">
                              ${planPrices[plan][billingCycle]}
                            </span>
                            <span className="text-gray-500 ml-2">
                              /{billingCycle === "monthly" ? "mo" : "yr"}
                            </span>
                          </div>
                        )}
                        {billingCycle === "yearly" && plan !== "FREE" && (
                          <p className="text-sm text-green-600 mt-2 font-medium">
                            $
                            {planPrices[plan].monthly * 12 -
                              planPrices[plan].yearly}{" "}
                            saved annually
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                      {planFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {typeof feature[
                              plan.toLowerCase() as keyof PlanFeature
                            ] === "boolean" ? (
                              feature[
                                plan.toLowerCase() as keyof PlanFeature
                              ] ? (
                                <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
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
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </div>
                              )
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
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
                            )}
                          </div>
                          <span className="ml-3 text-gray-700 font-medium">
                            {feature.name}
                            {typeof feature[
                              plan.toLowerCase() as keyof PlanFeature
                            ] === "string" && (
                              <span className="ml-2 text-teal-600 font-semibold">
                                (
                                {
                                  feature[
                                    plan.toLowerCase() as keyof PlanFeature
                                  ]
                                }
                                )
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <div className="absolute bottom-8 left-8 right-8">
                      {subscription?.plan === plan ? (
                        <div className="w-full bg-gray-100 text-gray-500 py-3 px-6 rounded-xl text-center font-semibold border-2 border-gray-200">
                          Current Plan
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(plan)}
                          disabled={upgrading === plan}
                          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                            plan === "PREMIUM"
                              ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                              : plan === "FREE"
                              ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800"
                              : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
                          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                          {upgrading === plan ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-solid rounded-full border-t-transparent animate-spin mr-2"></div>
                              Upgrading...
                            </div>
                          ) : plan === "FREE" ? (
                            "Get Started Free"
                          ) : (
                            `Upgrade to ${
                              plan.charAt(0) + plan.slice(1).toLowerCase()
                            }`
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
