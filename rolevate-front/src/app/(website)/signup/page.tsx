"use client";
import React, { useState } from "react";
import Image from "next/image";
import EnhancedSignupForm from "@/components/forms/EnhancedSignupForm";

export default function SignupPage() {
  const [accountType, setAccountType] = useState<'individual' | 'corporate'>('individual');

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch py-12 px-0 lg:px-0">
        {/* Signup Form Left */}
        <div className="flex flex-col justify-center px-6 sm:px-12 py-16 lg:py-24 bg-white/90 backdrop-blur-md border-r border-gray-100 shadow-xl max-w-xl w-full mx-auto lg:mx-0">
          <div className="group relative mb-4">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#13ead9]/15 to-[#0891b2]/15 text-[#0891b2] text-xs font-semibold rounded-full border border-[#13ead9]/30 backdrop-blur-sm shadow hover:shadow-lg transition-all duration-300">
              <span className="w-2 h-2 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full mr-2 animate-pulse"></span>
              Create Account
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight leading-tight mb-2 text-left">
            Sign up for Rolevate
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mb-8 max-w-md text-left">
            Join the next generation of hiring. Create your account to get started.
          </p>
          
          {/* Account Type Switcher */}
          <div className="flex gap-2 mb-8 w-full bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg border-0 text-xs font-semibold transition-all duration-300 ${accountType === 'individual' ? 'bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white shadow transform scale-105' : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setAccountType('individual')}
            >
              Individual
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg border-0 text-xs font-semibold transition-all duration-300 ${accountType === 'corporate' ? 'bg-gradient-to-r from-[#13ead9] to-[#0891b2] text-white shadow transform scale-105' : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setAccountType('corporate')}
            >
              Corporate
            </button>
          </div>

          {/* Enhanced Signup Form */}
          <EnhancedSignupForm accountType={accountType} />
          
          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="text-[#0891b2] font-semibold hover:text-[#13ead9] transition-colors duration-200"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Hero Image Right */}
        <div className="relative flex items-center justify-center px-8 py-16 lg:py-24 bg-gradient-to-br from-[#13ead9]/5 via-[#0891b2]/5 to-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#13ead9]/10 via-transparent to-[#0891b2]/10"></div>
          <div className="relative z-10 flex flex-col items-center max-w-lg text-center">
            <div className="relative mb-8 group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#13ead9]/20 to-[#0891b2]/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"></div>
              <Image
                src="/images/hero.png"
                alt="Join Rolevate"
                width={400}
                height={400}
                className="relative z-10 w-full max-w-sm mx-auto rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-display">
              Welcome to the Future of Hiring
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              Experience AI-powered interviews, smart candidate matching, and seamless recruitment workflows that transform how companies find talent.
            </p>
            <div className="flex flex-col space-y-3 text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full mr-3"></span>
                AI-Powered Interview Analysis
              </div>
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full mr-3"></span>
                Smart Candidate Matching
              </div>
              <div className="flex items-center justify-center">
                <span className="w-2 h-2 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full mr-3"></span>
                Real-time Collaboration Tools
              </div>
            </div>
          </div>
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-[#13ead9]/20 to-[#0891b2]/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-[#0891b2]/20 to-[#13ead9]/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
      </div>
    </section>
  );
}