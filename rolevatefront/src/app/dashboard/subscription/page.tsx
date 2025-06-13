"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  getSubscriptionStatus,
  getSubscriptionLimits,
  upgradeSubscription,
} from "@/services/auth.service";

// Define types based on the Prisma model and API response
interface Subscription {
  id: string;
  plan: "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE";
  status: "ACTIVE" | "INACTIVE" | "CANCELED" | "EXPIRED";
  startDate: string;
  endDate: string;
  renewsAt?: string;
  cancelledAt?: string;
  jobPostLimit: number;
  candidateLimit: number;
  interviewLimit: number;
  priceAmount?: number;
  currency: string;
  billingCycle?: "MONTHLY" | "QUARTERLY" | "YEARLY";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  features?: string[]; // Including features field from SubscriptionStatus
}

// Current usage limits interface
interface SubscriptionLimits {
  jobPosts: {
    used: number;
    limit: number;
  };
  interviews: {
    used: number;
    limit: number;
  };
  users: {
    used: number;
    limit: number;
  };
}

// Plan features for comparison
const planFeatures = {
  FREE: {
    name: "Free",
    price: "$0",
    jobPostLimit: 2,
    candidateLimit: 10,
    interviewLimit: 5,
    features: [
      "Limited to 2 job posts only",
      "Basic CV scanning",
      "No candidate tracking",
      "Limited email notifications",
    ],
  },
  BASIC: {
    name: "Starter",
    price: "$1,000/month",
    jobPostLimit: 25,
    candidateLimit: 500,
    interviewLimit: 100,
    features: [
      "Up to 25 job posts",
      "Advanced CV analysis",
      "Interview scheduling",
      "Email & SMS notifications",
      "Basic candidate analytics",
      "Priority support",
    ],
  },
  PREMIUM: {
    name: "Professional",
    price: "$5,000/month",
    jobPostLimit: 150,
    candidateLimit: 5000,
    interviewLimit: 1000,
    features: [
      "Up to 150 job posts",
      "Enterprise CV & skill matching",
      "Advanced video interview suite",
      "Team collaboration tools",
      "Custom workflows",
      "Full API access",
      "Performance analytics dashboard",
    ],
  },
  ENTERPRISE: {
    name: "White Label",
    price: "$50,000/month",
    jobPostLimit: -1, // Unlimited
    candidateLimit: -1, // Unlimited
    interviewLimit: -1, // Unlimited
    features: [
      "Unlimited everything",
      "Full white-labeling",
      "Custom AI model training",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom integrations",
      "Enterprise security features",
      "Advanced data analytics",
    ],
  },
};

const SubscriptionPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">(
    "MONTHLY"
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Define fallback values
        const fallbackSubscription: Subscription = {
          id: "fallback-id",
          plan: "FREE",
          status: "ACTIVE",
          startDate: new Date().toISOString(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString(),
          renewsAt: undefined,
          cancelledAt: undefined,
          jobPostLimit: 5,
          candidateLimit: 100,
          interviewLimit: 50,
          priceAmount: 0,
          currency: "USD",
          billingCycle: "MONTHLY",
          stripeCustomerId: undefined,
          stripeSubscriptionId: undefined,
          stripePriceId: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          companyId: user.companyId || "fallback-company-id",
        };

        const fallbackLimits: SubscriptionLimits = {
          jobPosts: { used: 0, limit: 5 },
          interviews: { used: 0, limit: 50 },
          users: { used: 0, limit: 3 },
        };

        // Set default values in case API calls fail
        let subscriptionData = fallbackSubscription;
        let limitsData = fallbackLimits;

        try {
          const apiSubscriptionData = await getSubscriptionStatus();
          if (apiSubscriptionData) {
            // Validate and cast plan to the expected type
            let plan: "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE" =
              fallbackSubscription.plan;
            if (
              apiSubscriptionData.plan === "FREE" ||
              apiSubscriptionData.plan === "BASIC" ||
              apiSubscriptionData.plan === "PREMIUM" ||
              apiSubscriptionData.plan === "ENTERPRISE"
            ) {
              plan = apiSubscriptionData.plan;
            }

            // Validate and cast status to the expected type
            let status: "ACTIVE" | "INACTIVE" | "CANCELED" | "EXPIRED" =
              fallbackSubscription.status;
            if (
              apiSubscriptionData.status === "ACTIVE" ||
              apiSubscriptionData.status === "INACTIVE" ||
              apiSubscriptionData.status === "CANCELED" ||
              apiSubscriptionData.status === "EXPIRED"
            ) {
              status = apiSubscriptionData.status;
            }

            // Merge fetched data with fallback, maintaining type safety
            subscriptionData = {
              ...fallbackSubscription,
              plan,
              status,
              endDate:
                apiSubscriptionData.endDate || fallbackSubscription.endDate,
              features: apiSubscriptionData.features || [],
              // Keeping the billing cycle from fallback if not provided by API
            };
          }
        } catch (subscriptionErr) {
          console.error("Error getting subscription status:", subscriptionErr);
          // Use fallback subscription (already set)
        }

        try {
          const apiLimitsData = await getSubscriptionLimits();
          if (apiLimitsData) {
            // Ensure all limit properties exist with proper structure
            limitsData = {
              jobPosts: {
                used: apiLimitsData.jobPosts?.used ?? 0,
                limit:
                  apiLimitsData.jobPosts?.limit ??
                  fallbackLimits.jobPosts.limit,
              },
              interviews: {
                used: apiLimitsData.interviews?.used ?? 0,
                limit:
                  apiLimitsData.interviews?.limit ??
                  fallbackLimits.interviews.limit,
              },
              users: {
                used: apiLimitsData.users?.used ?? 0,
                limit: apiLimitsData.users?.limit ?? fallbackLimits.users.limit,
              },
            };
          }
        } catch (limitsErr) {
          console.error("Error getting subscription limits:", limitsErr);
          // Use fallback limits (already set)
        }

        setSubscription(subscriptionData);
        setLimits(limitsData);
      } catch (err) {
        console.error("Error loading subscription data:", err);
        setError("Failed to load subscription information");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      loadSubscriptionData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleUpgrade = async (plan: string) => {
    try {
      setUpgrading(true);
      setError(null);

      await upgradeSubscription(plan);

      setSuccessMessage(
        `Successfully upgraded to ${
          planFeatures[plan as keyof typeof planFeatures].name
        } plan. The page will refresh shortly.`
      );

      // Refresh data after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("Error upgrading subscription:", err);
      setError(
        "Failed to upgrade subscription. Please try again or contact support."
      );
    } finally {
      setUpgrading(false);
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
          You need to be logged in to view subscription information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscription Management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your subscription plan and usage
          </p>
        </div>
        <Link href="/dashboard/profile" className="mt-2 sm:mt-0">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Profile
          </button>
        </Link>
      </div>

      {/* Success and error messages */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Current Subscription Card */}
      {subscription && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Current Subscription
              </h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === "ACTIVE"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
              >
                {subscription.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {planFeatures[subscription.plan as keyof typeof planFeatures]
                    ?.name || subscription.plan}{" "}
                  Plan
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Billing Cycle
                    </span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {subscription?.billingCycle
                        ? subscription.billingCycle.toLowerCase()
                        : "Monthly"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Start Date
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {subscription.startDate
                        ? new Date(subscription.startDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      End Date
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {subscription.endDate
                        ? new Date(subscription.endDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  {subscription.renewsAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Next Renewal
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(subscription.renewsAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {limits && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Usage & Limits
                  </h3>

                  {/* Job Posts usage metrics */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Job Posts
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {limits?.jobPosts?.used ?? 0} /{" "}
                        {limits?.jobPosts?.limit === -1
                          ? "Unlimited"
                          : limits?.jobPosts?.limit ?? 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width:
                            !limits?.jobPosts?.limit ||
                            limits.jobPosts.limit === -1
                              ? "10%"
                              : `${Math.min(
                                  100,
                                  ((limits?.jobPosts?.used ?? 0) /
                                    (limits?.jobPosts?.limit || 1)) *
                                    100
                                )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Interviews usage metrics */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Interviews
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {limits?.interviews?.used ?? 0} /{" "}
                        {limits?.interviews?.limit === -1
                          ? "Unlimited"
                          : limits?.interviews?.limit ?? 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width:
                            !limits?.interviews?.limit ||
                            limits.interviews.limit === -1
                              ? "10%"
                              : `${Math.min(
                                  100,
                                  ((limits?.interviews?.used ?? 0) /
                                    (limits?.interviews?.limit || 1)) *
                                    100
                                )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Team Members usage metrics */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Team Members
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {limits?.users?.used ?? 0} /{" "}
                        {limits?.users?.limit === -1
                          ? "Unlimited"
                          : limits?.users?.limit ?? 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width:
                            !limits?.users?.limit || limits.users.limit === -1
                              ? "10%"
                              : `${Math.min(
                                  100,
                                  ((limits?.users?.used ?? 0) /
                                    (limits?.users?.limit || 1)) *
                                    100
                                )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              billingCycle === "MONTHLY"
                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("YEARLY")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              billingCycle === "YEARLY"
                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60"
            }`}
          >
            Yearly{" "}
            <span className="text-xs text-green-600 dark:text-green-400">
              Save 20% ($12,000+ savings)
            </span>
          </button>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(planFeatures).map(([planKey, plan]) => {
          const isCurrentPlan = subscription?.plan === planKey;

          // Safely calculate price based on billing cycle
          let price = plan.price;
          if (planKey !== "FREE" && planKey !== "ENTERPRISE") {
            // Extract the numeric price from the string (e.g., "$1,000" from "$1,000/month")
            // Remove commas before parsing
            const numericPrice = parseInt(
              plan.price.replace("$", "").replace(/,/g, "").split("/")[0]
            );
            if (!isNaN(numericPrice)) {
              price =
                billingCycle === "YEARLY"
                  ? `$${(numericPrice * 0.8 * 12).toLocaleString()}/year`
                  : plan.price;
            }
          }

          return (
            <div
              key={planKey}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 ${
                isCurrentPlan
                  ? "border-blue-500 dark:border-blue-400"
                  : "border-transparent"
              }`}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {price}
                  </span>
                  {planKey !== "FREE" && planKey !== "ENTERPRISE" && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">
                      {billingCycle === "MONTHLY" ? "/month" : "/year"}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={
                    isCurrentPlan || upgrading || planKey === "ENTERPRISE"
                  }
                  onClick={() => handleUpgrade(planKey)}
                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm ${
                    isCurrentPlan
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 cursor-not-allowed"
                      : planKey === "ENTERPRISE"
                      ? "bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isCurrentPlan
                    ? "Current Plan"
                    : planKey === "ENTERPRISE"
                    ? "Contact Sales"
                    : upgrading
                    ? "Upgrading..."
                    : "Upgrade"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg mt-8">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                How do I change my subscription plan?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                You can upgrade your subscription plan at any time by selecting
                one of the plans above. Downgrades will take effect at the end
                of your billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                When will I be charged?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                For monthly plans, you'll be charged on the same day each month.
                For yearly plans, you'll be charged once per year on your
                subscription anniversary.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                How do I cancel my subscription?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                You can cancel your subscription at any time through your
                account settings or by contacting our support team. Your
                subscription will remain active until the end of your billing
                period.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                What happens if I exceed my plan limits?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                If you reach your plan limits, you'll need to upgrade to a
                higher tier to continue adding new items. The free plan has
                strict limitations, while our premium offerings provide
                substantial resources for enterprise needs.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Why are the plans priced at this level?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                Our pricing reflects the enterprise value our platform delivers.
                The Rolevate system uses advanced AI and machine learning
                technologies that deliver exceptional ROI by streamlining your
                hiring process, reducing time-to-hire, and improving candidate
                quality.
              </p>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Do you offer custom pricing?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                Yes, for large enterprises with unique needs, we offer custom
                pricing and tailored solutions. Contact our sales team to
                discuss how we can meet your specific requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
