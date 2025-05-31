// This file was moved from (website)/page.tsx to /login/page.tsx
"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { login, isAuthenticated, AuthError } from "@/services/auth.service";
import Logo from "@/components/logo/logo";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("from") || "/dashboard";

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (authenticated && isMounted) {
          router.replace(redirectPath);
        }
      } catch (err) {
        console.error("Auth check error on login page:", err);
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, [router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData);
      router.push(redirectPath);
    } catch (err) {
      const errorMessage =
        err instanceof AuthError
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setIsLoading(false); // Ensure isLoading is false on error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Show loading while checking authentication OR during login process
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-teal-600 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-[#1D1D1F] dark:text-white">
      {/* Top accent bar with gradient */}
      <div className="h-1.5 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 w-full"></div>

      <main className="flex flex-1 items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xl">
          {/* Left side - Auth form */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="mx-auto w-full max-w-md">
              {/* Logo and title */}
              <div className="text-center mb-10 flex flex-col items-center">
                <div className="flex flex-col justify-start border-b border-gray-200/50 dark:border-gray-700/50">
                                  <Logo />
    
                </div>
                <p className="text-gray-500 dark:text-gray-400 ">
                  access the AI intelligence system
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-md bg-teal-50 border border-teal-200 text-teal-600 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="username"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="username"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </label>
                    <a
                      href="#"
                      className="text-sm font-medium text-teal-600 hover:text-teal-500"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out"
                  >
                    {isLoading ? (
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-safe:animate-spin"></span>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-teal-600 dark:text-teal-400">
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Image/visual */}
          <div className="hidden lg:block lg:w-1/2 relative">
            {/* Enhanced overlay with multiple layers for better opacity and depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-700/95 to-teal-950/95 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-black/40"></div>
            <Image
              src="/images/lailafullhero2.png"
              alt="AI Intelligence"
              fill
              sizes="(max-width: 1023px) 0px, 50vw"
              priority
              className="object-cover object-center"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-teal-600 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
