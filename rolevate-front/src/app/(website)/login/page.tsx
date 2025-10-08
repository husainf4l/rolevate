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

      await signin(signinParams);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-white">
      <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-center h-full px-4 sm:px-6 lg:px-12 py-8 gap-10 lg:gap-0">
        {/* Login Form */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-left max-w-md w-full order-2 lg:order-1 lg:mr-16">
          <div className="mb-8 w-full flex flex-col items-center lg:items-start">
            <span className="inline-flex items-center px-4 py-2 bg-[#13ead9]/10 text-[#0891b2] text-sm font-semibold rounded-full border border-[#13ead9]/20">
              <span className="w-2 h-2 bg-[#13ead9] rounded-full mr-2 animate-pulse"></span>
              Welcome Back
            </span>
          </div>
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
                className="block w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 shadow-sm focus:border-[#13ead9] focus:ring-[#13ead9] focus:outline-none transition"
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
                className="block w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 shadow-sm focus:border-[#13ead9] focus:ring-[#13ead9] focus:outline-none transition"
                disabled={loading}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mb-2">
              <div className="flex items-center w-full sm:w-auto">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#13ead9] focus:ring-[#13ead9]"
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
                className="text-sm text-[#0891b2] hover:underline w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0"
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
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-8 text-sm text-gray-500 text-left">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#0891b2] hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
        {/* Illustration (hidden on mobile) */}
        <div className="hidden lg:flex items-center justify-center order-1 lg:order-2 mb-10 lg:mb-0 w-full lg:w-auto">
          <div className="relative w-full max-w-xs h-60 sm:max-w-md sm:h-80 lg:w-[36rem] lg:h-[28rem]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/8 via-white/15 to-[#0891b2]/8 rounded-sm shadow-corporate backdrop-blur-sm border border-white/20"></div>
            <div className="absolute inset-4 rounded-sm overflow-hidden shadow-inner">
              <Image
                src="/images/hero.png"
                alt="Login Illustration"
                fill
                className="object-cover rounded-sm"
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#13ead9] rounded-full shadow-corporate animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-[#0891b2] rounded-full shadow-corporate animate-pulse delay-1000"></div>
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


