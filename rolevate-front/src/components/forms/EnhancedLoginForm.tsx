"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { login } from "@/services/auth";

// Zod validation schema
const loginSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function EnhancedLoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Validate on change for real-time feedback
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      
      const response = await login({ email: data.email, password: data.password });
      
      if (response?.user) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Show success message
        toast.success(`Welcome back, ${response.user.name}!`);
        
        // Redirect based on user type and setup status
        if (response.user.userType === 'CANDIDATE') {
          router.push('/userdashboard');
        } else if (response.user.userType === 'COMPANY') {
          if (!response.user.companyId) {
            router.push('/dashboard/setup-company');
          } else {
            router.push('/dashboard');
          }
        }
      }
      
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get field validation state
  const getFieldState = (fieldName: keyof LoginFormData) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    
    if (hasError) return "error";
    if (isTouched && !hasError) return "success";
    return "default";
  };

  // Helper function to get input classes based on validation state
  const getInputClasses = (fieldName: keyof LoginFormData) => {
    const state = getFieldState(fieldName);
    const baseClasses = "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200";
    
    switch (state) {
      case "error":
        return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50`;
      case "success":
        return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50`;
      default:
        return `${baseClasses} border-gray-200 focus:border-[#0891b2] focus:ring-[#0891b2]/20`;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={getInputClasses("email")}
          placeholder="Enter your email address"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`${getInputClasses("password")} pr-12`}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <a 
          href="/forgot-password" 
          className="text-sm text-[#0891b2] hover:text-[#13ead9] font-medium transition-colors duration-200"
        >
          Forgot your password?
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || isSubmitting}
        className="w-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading || isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Signing In...
          </div>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}