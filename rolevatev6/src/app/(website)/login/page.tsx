'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services";

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  type="email"
                  id="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 h-12"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 h-12"
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
                <a
                  href="#"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-sm p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white h-12 font-medium text-base"
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
    </section>
  );
}