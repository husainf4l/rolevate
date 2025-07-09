"use client";
import React, { useState } from "react";
import { signup, UserType } from "@/services/auth";
import Image from "next/image";

export default function SignupPage() {
  const [accountType, setAccountType] = useState<'individual' | 'corporate'>('individual');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    invitationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = require('next/navigation').useRouter();

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
          <div className="flex gap-2 mb-4 w-full bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
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
          <form
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setSuccess(false);
              if (form.password !== form.confirmPassword) {
                setError('Passwords do not match');
                return;
              }
              setLoading(true);
              try {
                const userType: UserType = accountType === 'corporate' ? 'COMPANY' : 'CANDIDATE';
                const payload = {
                  email: form.email,
                  password: form.password,
                  name: form.name,
                  userType,
                  phone: form.phone,
                  ...(accountType === 'corporate' && form.invitationCode ? { invitationCode: form.invitationCode } : {}),
                };
                const response = await signup(payload);
                // Save token and user to localStorage or cookies if needed
                if (response && response.user) {
                  if (response.user.userType === 'CANDIDATE') {
                    router.push('/userdashboard');
                  } else if (response.user.userType === 'COMPANY') {
                    if (!response.user.companyId) {
                      router.push('/dashboard/company-profile');
                    } else {
                      router.push('/dashboard');
                    }
                  }
                }
                setSuccess(true);
                setForm({ name: '', email: '', password: '', confirmPassword: '', phone: '', invitationCode: '' });
              } catch (err: any) {
                setError(err.message || 'Signup failed');
              } finally {
                setLoading(false);
              }
            }}
          >
            {/* Name field */}
            <div className="col-span-1">
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all duration-200 text-sm"
                placeholder="Enter your full name"
              />
            </div>
            {/* Email field */}
            <div className="col-span-1">
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all duration-200 text-sm"
                placeholder="Enter your email"
              />
            </div>
            {/* Password field */}
            <div className="col-span-1">
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all duration-200 text-sm"
                placeholder="Create a strong password"
              />
            </div>
            {/* Confirm Password field */}
            <div className="col-span-1">
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all duration-200 text-sm"
                placeholder="Confirm your password"
              />
            </div>
            {/* Phone field for all */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                id="phone"
                autoComplete="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all duration-200 text-sm"
                placeholder="Enter your phone number"
              />
            </div>
            {/* Invitation Code field for corporate users */}
            {accountType === 'corporate' && (
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="invitationCode" className="block text-xs font-medium text-gray-700 mb-1">Invitation Code</label>
                <input
                  type="text"
                  id="invitationCode"
                  value={form.invitationCode}
                  onChange={e => setForm(f => ({ ...f, invitationCode: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all duration-200 text-sm"
                  placeholder="Enter invitation code (optional)"
                />
              </div>
            )}
            {/* Error/Success */}
            {error && (
              <div className="col-span-1 md:col-span-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-xs font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="col-span-1 md:col-span-2 bg-green-50 border border-green-200 rounded-xl p-3 text-green-600 text-xs font-medium">
                Account created successfully!
              </div>
            )}
            {/* Submit Button */}
            <div className="col-span-1 md:col-span-2 pt-2">
              <button
                type="submit"
                className="group relative w-full rounded-lg bg-gradient-to-r from-[#13ead9] to-[#0891b2] py-3 px-6 text-white font-semibold shadow hover:shadow-lg transition-all duration-200 text-sm font-display overflow-hidden transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                <span className="relative z-10">{loading ? 'Creating...' : 'Create Account'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0891b2] to-[#13ead9] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </button>
            </div>
          </form>
          <p className="mt-8 text-xs text-gray-500 text-left">
            Already have an account?{' '}
            <a href="/login" className="text-[#0891b2] hover:text-[#13ead9] font-semibold transition-colors duration-200 relative group">
              Sign in
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#13ead9] to-[#0891b2] group-hover:w-full transition-all duration-300"></span>
            </a>
          </p>
        </div>
        {/* Illustration Right (restored to previous style) */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-96 h-80 lg:w-[36rem] lg:h-[28rem] group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/10 via-white/20 to-[#0891b2]/10 rounded-[2.5rem] shadow-2xl backdrop-blur-sm border border-white/30 group-hover:shadow-3xl transition-all duration-500"></div>
            <div className="absolute inset-4 rounded-[2rem] overflow-hidden shadow-inner ring-1 ring-white/20">
              <Image
                src="/images/hero.png"
                alt="Signup Illustration"
                fill
                className="object-cover rounded-[2rem] group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent rounded-[2rem]"></div>
            </div>
            <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full shadow-2xl animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-r from-[#0891b2] to-[#13ead9] rounded-full shadow-2xl animate-pulse delay-1000 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gradient-to-r from-[#13ead9]/50 to-[#0891b2]/50 rounded-full shadow-lg animate-pulse delay-500"></div>
            <div className="absolute top-1/4 -right-2 w-4 h-4 bg-gradient-to-r from-[#0891b2]/50 to-[#13ead9]/50 rounded-full shadow-lg animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
