"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services";

export default function SignupPage() {
  const [accountType, setAccountType] = useState<'individual' | 'corporate'>('individual');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const userType = accountType === 'individual' ? 'CANDIDATE' : 'BUSINESS';
      
      await authService.signup({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        userType,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl p-12 border border-gray-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Account Created Successfully!
            </h3>
            <p className="text-gray-600 mb-8">
              Redirecting you to the login page...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Signup Form */}
          <div className="order-2 lg:order-1 max-w-md mx-auto lg:mx-0">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Create Your Account
              </h1>
              <p className="text-gray-600 text-lg">
                Join thousands of professionals transforming their recruitment experience.
              </p>
            </div>

            {/* Account Type Switcher */}
            <div className="mb-8">
              <div className="flex p-1 bg-gray-100 rounded-sm">
                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all ${
                    accountType === 'individual'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('corporate')}
                  className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all ${
                    accountType === 'corporate'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  Corporate
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-sm border border-gray-200 bg-white px-4 py-4 text-gray-900 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-sm border border-gray-200 bg-white px-4 py-4 text-gray-900 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-sm border border-gray-200 bg-white px-4 py-4 text-gray-900 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-sm border border-gray-200 bg-white px-4 py-4 text-gray-900 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 focus:outline-none transition-all"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-sm p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-sm font-medium text-base transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Illustration */}
          <div className="order-1 lg:order-2">
            <div className="relative bg-gray-50 rounded-3xl p-8 lg:p-12">
              <div className="aspect-square rounded-2xl overflow-hidden mb-8">
                <Image
                  src="/images/hero.png"
                  alt="Rolevate - AI-Powered Recruitment Platform"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Next-Generation Recruitment
                </h2>
                <p className="text-gray-600 mb-6">
                  Experience intelligent hiring with AI-powered tools and automated workflows.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span className="text-sm">AI Interview Analysis</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span className="text-sm">Smart Candidate Matching</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span className="text-sm">Real-time Collaboration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}