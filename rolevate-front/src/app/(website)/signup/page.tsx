import React from "react";
import Image from "next/image";

export default function SignupPage() {
  return (
    <section className="w-full min-h-screen bg-white flex items-center">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between py-24 px-6 lg:px-12">
        {/* Illustration */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-2 mb-16 lg:mb-0 lg:ml-16">
          <div className="relative w-96 h-80 lg:w-[36rem] lg:h-[28rem]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/8 via-white/15 to-[#0891b2]/8 rounded-[2.5rem] shadow-corporate backdrop-blur-sm border border-white/20"></div>
            <div className="absolute inset-4 rounded-[2rem] overflow-hidden shadow-inner">
              <Image
                src="/images/hero.png"
                alt="Signup Illustration"
                fill
                className="object-cover rounded-[2rem]"
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#13ead9] rounded-full shadow-corporate animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-[#0891b2] rounded-full shadow-corporate animate-pulse delay-1000"></div>
          </div>
        </div>
        {/* Signup Form */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-md order-2 lg:order-1">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-[#13ead9]/10 text-[#0891b2] text-sm font-semibold rounded-full border border-[#13ead9]/20">
              <span className="w-2 h-2 bg-[#13ead9] rounded-full mr-2 animate-pulse"></span>
              Create Account
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1] px-2 sm:px-0">
            Sign up for Rolevate
          </h1>
          <form className="w-full max-w-sm space-y-6 mt-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                autoComplete="name"
                required
                className="block w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 shadow-sm focus:border-[#13ead9] focus:ring-[#13ead9] focus:outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 shadow-sm focus:border-[#13ead9] focus:ring-[#13ead9] focus:outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 shadow-sm focus:border-[#13ead9] focus:ring-[#13ead9] focus:outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                autoComplete="new-password"
                required
                className="block w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 shadow-sm focus:border-[#13ead9] focus:ring-[#13ead9] focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-[#13ead9] to-[#0891b2] py-3 px-6 text-white font-semibold shadow-corporate hover:shadow-xl transition-all duration-200 text-base font-display"
            >
              Create Account
            </button>
          </form>
          <p className="mt-8 text-sm text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="text-[#0891b2] hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
