"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signin } from "@/services/auth";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Get redirect URL from search params
      const redirect = searchParams?.get("redirect");

      const signinParams: {
        email: string;
        password: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router: any;
        redirectUrl?: string;
      } = {
        email,
        password,
        router,
      };

      // If there's a redirect parameter, use it
      if (redirect) {
        signinParams.redirectUrl = decodeURIComponent(redirect);
      }

      const user = await signin(signinParams);
      
      // Additional fallback: if signin doesn't redirect, do it manually
      if (!redirect && user) {
        if (user.userType === 'COMPANY' && !user.companyId) {
          window.location.href = '/dashboard/setup-company';
        } else if (user.userType === 'COMPANY') {
          window.location.href = '/dashboard';
        } else if (user.userType === 'CANDIDATE') {
          window.location.href = '/userdashboard';
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-white">
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-center h-full px-4 sm:px-6 lg:px-12 py-8 gap-10 lg:gap-0">
        {/* Login Form */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-left max-w-md w-full order-2 lg:order-1 lg:mr-16">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1] px-2 sm:px-0 w-full text-left">
            Sign in to your account
          </h1>
          <form
            className="w-full max-w-sm space-y-6 mt-4"
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1 text-left"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none transition"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1 text-left"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none transition"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mb-2">
              <div className="flex items-center w-full sm:w-auto">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  disabled={loading}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0 font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-left">{error}</div>
            )}
            <Button
              type="submit"
              variant="default"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-8 text-sm text-gray-600 text-left">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors underline-offset-2"
            >
              Sign up
            </Link>
          </p>
        </div>
        {/* Illustration (hidden on mobile) */}
        <div className="hidden lg:flex items-center justify-center order-1 lg:order-2 mb-10 lg:mb-0 w-full lg:w-auto">
          <div className="relative w-full max-w-xs h-60 sm:max-w-md sm:h-80 lg:w-[36rem] lg:h-[28rem]">
            <div className="absolute inset-0 bg-white/10 rounded-sm shadow-md backdrop-blur-sm border border-white/20"></div>
            <div className="absolute inset-4 rounded-sm overflow-hidden shadow-inner">
              <Image
                src="/images/hero.png"
                alt="Login Illustration"
                fill
                className="object-cover rounded-sm"
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-400 rounded-full shadow-md"></div>
            <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-primary-600 rounded-full shadow-md"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}


