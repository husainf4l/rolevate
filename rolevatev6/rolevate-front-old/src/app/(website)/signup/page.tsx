"use client";
import React, { useState } from "react";
import Image from "next/image";
import EnhancedSignupForm from "@/components/forms/EnhancedSignupForm";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const [accountType, setAccountType] = useState<'individual' | 'corporate'>('individual');

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Signup Form Left */}
          <div className="order-2 lg:order-1">
            <div className="max-w-md mx-auto lg:mx-0">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200/60 text-primary-700 text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                Account Setup
              </div>

              {/* Header */}
              <div className="mb-10">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  Create Your <span className="text-primary-600 font-extrabold">Rolevate</span> Account
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Join thousands of professionals transforming their recruitment experience with AI-powered tools.
                </p>
              </div>

              {/* Account Type Switcher */}
              <div className="mb-8">
                <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setAccountType('individual')}
                    className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all duration-200 ${
                      accountType === 'individual'
                        ? 'bg-primary-600 text-white shadow-sm border border-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('corporate')}
                    className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-all duration-200 ${
                      accountType === 'corporate'
                        ? 'bg-primary-600 text-white shadow-sm border border-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    Corporate
                  </button>
                </div>
              </div>

              {/* Enhanced Signup Form */}
              <EnhancedSignupForm accountType={accountType} />

              {/* Sign In Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <a
                    href="/login"
                    className="text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200 underline underline-offset-2"
                  >
                    Sign in here
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Hero Section Right */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-blue-50/30 to-slate-50/20 rounded-2xl"></div>

              {/* Content Card */}
              <Card className="relative bg-white/90 backdrop-blur-sm border-gray-100">
                <CardContent className="p-8 lg:p-10">
                  {/* Hero Image */}
                  <div className="relative mb-8">
                    <div className="overflow-hidden rounded-xl shadow-md border border-gray-100">
                      <Image
                        src="/images/hero.png"
                        alt="Rolevate - AI-Powered Recruitment Platform"
                        width={500}
                        height={400}
                        className="w-full h-auto object-cover"
                        priority
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Next-Generation Recruitment
                    </h2>
                    <p className="text-gray-600 text-base leading-relaxed mb-8">
                      Experience intelligent hiring with AI-powered interviews, automated candidate matching, and collaborative workflows.
                    </p>

                    {/* Feature List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm">AI Interview Analysis</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm">Smart Candidate Matching</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm">Real-time Collaboration</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

