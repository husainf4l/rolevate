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
          {/* Account Type Switcher */}
          <div className="flex gap-4 mb-8 w-full">
            <button
              type="button"
              className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${accountType === 'individual' ? 'bg-[#13ead9]/10 border-[#13ead9] text-[#0891b2]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setAccountType('individual')}
            >
              Individual
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${accountType === 'corporate' ? 'bg-[#13ead9]/10 border-[#13ead9] text-[#0891b2]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setAccountType('corporate')}
            >
              Corporate
            </button>
          </div>
          <form
            className="w-full max-w-sm space-y-6 mt-4"
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
                await signup(payload);
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-md focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all"
              />
            </div>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-md focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all"
              />
            </div>
            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-md focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all"
              />
            </div>
            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-md focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all"
              />
            </div>
            {/* Phone field for all */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                autoComplete="tel"
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-md focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all"
              />
            </div>
            {/* Invitation Code field for corporate users */}
            {accountType === 'corporate' && (
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Invitation Code
                </label>
                <input
                  type="text"
                  id="invitationCode"
                  value={form.invitationCode}
                  onChange={e => setForm(f => ({ ...f, invitationCode: e.target.value }))}
                  className="block w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-md focus:border-[#13ead9] focus:ring-2 focus:ring-[#13ead9]/20 focus:outline-none transition-all"
                />
              </div>
            )}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">Account created successfully!</div>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-[#13ead9] to-[#0891b2] py-3 px-6 text-white font-semibold shadow-corporate hover:shadow-xl transition-all duration-200 text-base font-display disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Account'}
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
