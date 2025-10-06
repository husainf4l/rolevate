"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signup, UserType } from "@/services/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// Zod validation schema
const signupSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
  invitationCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface EnhancedSignupFormProps {
  accountType: 'individual' | 'corporate';
}

export default function EnhancedSignupForm({ accountType }: EnhancedSignupFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange", // Validate on change for real-time feedback
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    try {
      setLoading(true);
      
      const userType: UserType = accountType === 'individual' ? 'CANDIDATE' : 'COMPANY';
      
      const signupData: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        userType,
      };
      
      if (data.invitationCode) {
        signupData.invitationCode = data.invitationCode;
      }
      
      await signup(signupData);
      
      toast.success("Account created successfully! Please check your email to verify your account.");
      router.push("/login");
      
    } catch (error: any) {
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get field validation state
  const getFieldState = (fieldName: keyof SignupFormData) => {
    const hasError = errors[fieldName];
    const isTouched = touchedFields[fieldName];
    
    if (hasError) return "error";
    if (isTouched && !hasError) return "success";
    return "default";
  };

  // Helper function to get input classes based on validation state
  const getInputClasses = (fieldName: keyof SignupFormData) => {
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
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={getInputClasses("name")}
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.name.message}
          </p>
        )}
      </div>

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
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className={getInputClasses("phone")}
          placeholder="Enter your phone number"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.phone.message}
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
            placeholder="Create a strong password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
        {/* Password strength indicator */}
        {passwordValue && (
          <div className="mt-2">
            <div className="text-xs text-gray-600 mb-1">Password strength:</div>
            <div className="flex space-x-1">
              <div className={`h-1 w-1/4 rounded ${passwordValue.length >= 8 ? 'bg-green-400' : 'bg-gray-200'}`} />
              <div className={`h-1 w-1/4 rounded ${/[A-Z]/.test(passwordValue) ? 'bg-green-400' : 'bg-gray-200'}`} />
              <div className={`h-1 w-1/4 rounded ${/[a-z]/.test(passwordValue) ? 'bg-green-400' : 'bg-gray-200'}`} />
              <div className={`h-1 w-1/4 rounded ${/\d/.test(passwordValue) ? 'bg-green-400' : 'bg-gray-200'}`} />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            className={`${getInputClasses("confirmPassword")} pr-12`}
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Invitation Code Field (Corporate only) */}
      {accountType === 'corporate' && (
        <div>
          <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-2">
            Invitation Code (Optional)
          </label>
          <input
            id="invitationCode"
            type="text"
            {...register("invitationCode")}
            className={getInputClasses("invitationCode")}
            placeholder="Enter invitation code if you have one"
          />
          {errors.invitationCode && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠</span>
              {errors.invitationCode.message}
            </p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || isSubmitting}
        className="w-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading || isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Creating Account...
          </div>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}