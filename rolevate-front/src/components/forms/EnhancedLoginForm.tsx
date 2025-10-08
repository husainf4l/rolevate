"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { login } from "@/services/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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

  const form = useForm<LoginFormData>({
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...field}
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
        <Button
          type="submit"
          disabled={loading || form.formState.isSubmitting}
          className="w-full bg-gradient-to-r from-[#13ead9] to-[#0891b2] hover:from-[#13ead9]/90 hover:to-[#0891b2]/90"
        >
          {loading || form.formState.isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
}

