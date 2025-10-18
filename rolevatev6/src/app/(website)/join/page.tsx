"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  getInvitation,
  getCompanyById,
  createUser as createUserService,
  login as loginService,
  acceptCompanyInvitation,
  type Invitation,
  type Company,
} from "@/services/invitation.service";

export default function JoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams?.get("code");

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [step, setStep] = useState<"loading" | "form" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load invitation on mount
  useEffect(() => {
    if (!code) {
      setStep("error");
      setErrorMessage("No invitation code provided");
      return;
    }

    loadInvitation();
  }, [code]);

  const loadInvitation = async () => {
    try {
      const inv = await getInvitation(code!);

      if (!inv) {
        setStep("error");
        setErrorMessage("Invalid or expired invitation code");
        return;
      }

      setInvitation(inv);

      // Check if invitation is valid
      if (inv.status !== "PENDING") {
        setStep("error");
        setErrorMessage("This invitation has already been used or cancelled");
        return;
      }

      const expiresAt = new Date(inv.expiresAt);
      if (expiresAt < new Date()) {
        setStep("error");
        setErrorMessage("This invitation has expired");
        return;
      }

      // Pre-fill email if provided
      if (inv.email) {
        setFormData((prev) => ({ ...prev, email: inv.email! }));
      }

      // Load company details
      const companyData = await getCompanyById(inv.companyId);
      if (companyData) {
        setCompany(companyData);
      }

      setStep("form");
    } catch (error: any) {
      console.error("Error loading invitation:", error);
      setStep("error");
      setErrorMessage(error?.message || "Failed to load invitation details");
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Step 1: Try to create user
      let userCreated = false;
      try {
        await createUserService({
          userType: "BUSINESS",
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
        });
        userCreated = true;
      } catch (createError: any) {
        // Check if error is due to duplicate email
        const isDuplicateEmail = 
          createError?.message?.includes("duplicate") || 
          createError?.message?.includes("already exists") ||
          createError?.message?.includes("UQ_e12875dfb3b1d92d7d7c5377e22");
        
        if (!isDuplicateEmail) {
          throw createError; // Re-throw if it's not a duplicate email error
        }
        // If duplicate email, continue to login (user might already exist)
        console.log("User already exists, attempting to login");
      }

      // Step 2: Login to get access token
      const loginData = await loginService(formData.email, formData.password);

      if (!loginData?.access_token) {
        throw new Error("Failed to login. Please check your password.");
      }

      // Save token
      localStorage.setItem("access_token", loginData.access_token);

      // Step 3: Accept the invitation
      await acceptCompanyInvitation(code!, loginData.access_token);

      // Step 4: Login again to get updated token with companyId
      const updatedLoginData = await loginService(formData.email, formData.password);
      
      if (updatedLoginData?.access_token) {
        // Update token with the new one that includes companyId
        localStorage.setItem("access_token", updatedLoginData.access_token);
      }

      // Success!
      setStep("success");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error during signup:", error);
      
      // Provide more specific error messages
      let errorMsg = "Failed to complete signup. Please try again.";
      
      if (error?.message?.includes("password")) {
        errorMsg = "Invalid password. If you already have an account, please use your existing password.";
      } else if (error?.message?.includes("login")) {
        errorMsg = "Failed to login. Please check your credentials.";
      } else if (error?.message?.includes("invitation")) {
        errorMsg = "Failed to accept invitation. The invitation may have expired or been used.";
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Loading state
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Aboard!
          </h1>
          <p className="text-gray-600 mb-2">
            Your account has been created successfully.
          </p>
          {company && (
            <p className="text-gray-600 mb-6">
              You've joined <span className="font-semibold">{company.name}</span>
            </p>
          )}
          <p className="text-sm text-gray-500">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Company Info Card */}
        {company && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
            {company.logo && (
              <img
                src={company.logo}
                alt={company.name}
                className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
              />
            )}
            {!company.logo && (
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BuildingOfficeIcon className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Join {company.name}
            </h2>
            <p className="text-gray-600 text-sm">
              You've been invited to join the team
            </p>
          </div>
        )}

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create Your Account
          </h1>

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info message for existing users */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> If you already have an account, enter your existing password to join this company.
              </p>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
              </div>
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address *
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  } ${invitation?.email ? "bg-gray-50" : ""}`}
                  placeholder="john@example.com"
                  disabled={isSubmitting || !!invitation?.email}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number (Optional)
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="+1 234 567 8900"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password *
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                At least 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                    formErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Create Account & Join"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
