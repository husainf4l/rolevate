import React from "react";
import Image from "next/image";

export default function LoginPage() {
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
                alt="Login Illustration"
                fill
                className="object-cover rounded-[2rem]"
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#13ead9] rounded-full shadow-corporate animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-[#0891b2] rounded-full shadow-corporate animate-pulse delay-1000"></div>
          </div>
        </div>
        {/* Login Form */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-md order-2 lg:order-1">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-[#13ead9]/10 text-[#0891b2] text-sm font-semibold rounded-full border border-[#13ead9]/20">
              <span className="w-2 h-2 bg-[#13ead9] rounded-full mr-2 animate-pulse"></span>
              Welcome Back
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1] px-2 sm:px-0">
            Sign in to your account
          </h1>
          <form className="w-full max-w-sm space-y-6 mt-4">
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
                autoComplete="current-password"
                required
                className="block w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-gray-900 shadow-sm focus:border-[#13ead9] focus:ring-[#13ead9] focus:outline-none transition"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#13ead9] focus:ring-[#13ead9]"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-[#0891b2] hover:underline">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-[#13ead9] to-[#0891b2] py-3 px-6 text-white font-semibold shadow-corporate hover:shadow-xl transition-all duration-200 text-base font-display"
            >
              Sign In
            </button>
          </form>
          <p className="mt-8 text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <a href="#" className="text-[#0891b2] hover:underline font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
