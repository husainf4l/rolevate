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
  const redirectPath = searchParams.get("from") || "/";

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
        <div className="w-16 h-16 border-4 border-red-600 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
 <div className="bg-blue-500 h-screen"><Logo/></div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-red-600 border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
