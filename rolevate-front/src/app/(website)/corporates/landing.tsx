"use client";

import React from "react";
import { Button } from "@/components/common/Button";
import Image from "next/image";

export default function CorporateLanding() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto flex flex-col lg:flex-row items-center justify-between py-16 px-6 lg:px-12">
        {/* Text Section */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
          <span className="inline-flex items-center px-4 py-2 bg-[#13ead9]/10 text-[#0891b2] text-sm font-semibold rounded-full border border-[#13ead9]/20 mb-6">
            <span className="w-2 h-2 bg-[#13ead9] rounded-full mr-2 animate-pulse"></span>
            For Employers & Corporates
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Hire Smarter. Grow Faster.
          </h1>
          <p className="font-text text-lg lg:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
            Discover how our AI-powered recruitment platform helps you attract, assess, and hire top talent across the Middle East. Streamline your hiring process, reduce time-to-hire, and build your dream team with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button variant="hero-primary" size="lg" href="/corporate/signup">
              Request a Demo
            </Button>
            <Button variant="hero-secondary" size="lg" href="/corporate/contact">
              Contact Sales
            </Button>
          </div>
        </div>
        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center mt-12 lg:mt-0 lg:ml-16">
          <div className="relative w-96 h-80 lg:w-[36rem] lg:h-[28rem]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/8 via-white/15 to-[#0891b2]/8 rounded-[2.5rem] shadow-corporate backdrop-blur-sm border border-white/20"></div>
            <div className="absolute inset-4 rounded-[2rem] overflow-hidden shadow-inner bg-white flex items-center justify-center">
              <Image
                src="/images/hero.png"
                alt="Corporate Platform Illustration"
                fill
                className="object-cover rounded-[2rem]"
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#13ead9] rounded-full shadow-corporate animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-[#0891b2] rounded-full shadow-corporate animate-pulse delay-1000"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to attract, assess, and hire the best talent—faster and smarter.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#13ead9]/10 rounded-full flex items-center justify-center mb-4 text-3xl">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Screening</h3>
            <p className="text-gray-600">Automatically screen and rank candidates based on skills, experience, and fit—saving you hours of manual work.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#13ead9]/10 rounded-full flex items-center justify-center mb-4 text-3xl">🎥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Video Interviewing</h3>
            <p className="text-gray-600">Assess candidates with structured, on-demand video interviews and AI-driven insights for better hiring decisions.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#13ead9]/10 rounded-full flex items-center justify-center mb-4 text-3xl">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">Track your hiring funnel, diversity, and performance with real-time dashboards and actionable analytics.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#13ead9]/10 rounded-full flex items-center justify-center mb-4 text-3xl">🌍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Regional Talent Pool</h3>
            <p className="text-gray-600">Access a curated pool of top candidates from across the Middle East, ready to join your team.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#13ead9]/10 rounded-full flex items-center justify-center mb-4 text-3xl">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Compliant</h3>
            <p className="text-gray-600">Your data is protected with enterprise-grade security and full compliance with regional regulations.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#13ead9]/10 rounded-full flex items-center justify-center mb-4 text-3xl">🤝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Dedicated Support</h3>
            <p className="text-gray-600">Our team is here to help you succeed, from onboarding to ongoing support and best practices.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-6 lg:px-12 py-12 lg:py-20 text-center">
        <div className="bg-gradient-to-r from-[#13ead9]/10 to-[#0891b2]/10 rounded-2xl p-10 md:p-16 shadow-lg inline-block">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Request a personalized demo or talk to our team to see how we can help your organization hire smarter and faster.
          </p>
          <Button variant="hero-primary" size="xl" href="/corporate/signup">
            Request a Demo
          </Button>
        </div>
      </section>
    </main>
  );
}
