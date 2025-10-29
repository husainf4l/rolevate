'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services";
import { apolloClient } from "@/lib/apollo";
import { gql } from "@apollo/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });
      authService.redirectAfterLogin(response.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);

    try {
      const { data } = await apolloClient.mutate<{ forgotPassword: boolean }>({
        mutation: gql`
          mutation ForgotPassword($input: ForgotPasswordInput!) {
            forgotPassword(input: $input)
          }
        `,
        variables: {
          input: { email: forgotEmail }
        }
      });

      if (data?.forgotPassword) {
        toast.success("Reset code sent to your WhatsApp! Check your phone.");
        setShowForgotPassword(false);
        setShowResetPassword(true);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset code");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken.trim()) {
      toast.error("Please enter the reset code from WhatsApp");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setForgotLoading(true);

    try {
      const { data } = await apolloClient.mutate<{ resetPassword: boolean }>({
        mutation: gql`
          mutation ResetPassword($input: ResetPasswordInput!) {
            resetPassword(input: $input)
          }
        `,
        variables: {
          input: {
            token: resetToken,
            newPassword: newPassword
          }
        }
      });

      if (data?.resetPassword) {
        toast.success("Password reset successfully! You can now login.");
        setShowResetPassword(false);
        setResetToken("");
        setNewPassword("");
        setConfirmPassword("");
        setForgotEmail("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <section className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Login Form */}
          <div className="order-2 lg:order-1 max-w-md mx-auto lg:mx-0">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Sign in to your account
              </h1>
              <p className="text-gray-600 text-lg">
                Welcome back! Please sign in to continue.
              </p>
            </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-10 text-sm rounded-lg"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 h-10 text-sm rounded-lg"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    disabled={loading}
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white h-10 text-sm font-medium rounded-lg"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-8 text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Illustration */}
          <div className="order-1 lg:order-2">
            <div className="relative bg-gray-50 rounded-3xl p-8 lg:p-12">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/images/hero.png"
                  alt="Login Illustration"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a reset code via WhatsApp. The code will be valid for 15 minutes.
            </p>
            
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  type="email"
                  id="forgot-email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="mt-1.5 h-10 text-sm rounded-lg"
                  disabled={forgotLoading}
                  placeholder="your@email.com"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail("");
                  }}
                  className="flex-1 h-10 text-sm rounded-lg"
                  disabled={forgotLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 text-sm bg-primary-600 hover:bg-primary-700 rounded-lg"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending..." : "Send Code"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600 mb-6">
              Enter the reset code sent to your WhatsApp and your new password. The code is valid for 15 minutes.
            </p>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-token" className="text-sm font-medium text-gray-700">
                  Reset Code
                </Label>
                <Input
                  type="text"
                  id="reset-token"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="mt-1.5 h-10 text-sm font-mono rounded-lg"
                  disabled={forgotLoading}
                  placeholder="Paste the code from WhatsApp"
                />
              </div>

              <div>
                <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                  New Password
                </Label>
                <Input
                  type="password"
                  id="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5 h-10 text-sm rounded-lg"
                  disabled={forgotLoading}
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  id="confirm-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5 h-10 text-sm rounded-lg"
                  disabled={forgotLoading}
                  placeholder="Re-enter your password"
                />
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetToken("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 h-10 text-sm rounded-lg"
                  disabled={forgotLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 text-sm bg-primary-600 hover:bg-primary-700 rounded-lg"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}