"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";

export default function JoinCompanyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setInvitationCode(code);
      validateInvitationCode(code);
    }
  }, [searchParams]);

  const validateInvitationCode = async (code: string) => {
    try {
      setLoading(true);
      // For now, we'll set a default company info since we don't have a validation endpoint
      // In a real scenario, you'd call an API to get company details by invitation code
      setCompanyInfo({
        name: "Company",
        logo: "C",
        industry: "Technology",
        headquarters: "Location",
        description: "Join this company using your invitation code"
      });
    } catch (error) {
      console.error('Error validating invitation code:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUpAndJoin = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      setSigning(true);
      
      // First, sign up the user
      const signupResponse = await fetch('https://rolevate.com/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: "COMPANY",
        }),
      });

      if (signupResponse.ok) {
        const signupData = await signupResponse.json();
        
        // Store the token
        if (signupData.token) {
          localStorage.setItem('token', signupData.token);
        }
        
        // Then join the company with the invitation code
        const joinResponse = await fetch('https://rolevate.com/api/company/join', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${signupData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invitationCode: invitationCode
          }),
        });
        
        if (joinResponse.ok) {
          alert('Successfully signed up and joined the company!');
          router.push('/dashboard');
        } else {
          const joinError = await joinResponse.json();
          alert(`Failed to join company: ${joinError.message || 'Unknown error'}`);
        }
      } else {
        const signupError = await signupResponse.json();
        alert(`Failed to sign up: ${signupError.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error signing up and joining company:', error);
      alert('Error during signup process');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ead9] mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#13ead9] to-[#0891b2] rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
            {companyInfo?.logo || companyInfo?.name?.charAt(0) || 'C'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign Up & Join Company
          </h1>
          {invitationCode ? (
            <div>
              <p className="text-lg text-gray-700 font-semibold mb-1">
                {companyInfo?.name || "Company"}
              </p>
              <p className="text-gray-600">
                Create your account to join this company
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              No invitation code provided
            </p>
          )}
        </div>

        {invitationCode ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Create a password"
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invitation Code
              </label>
              <input
                type="text"
                value={invitationCode}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 font-medium focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Invitation Code
            </label>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => {
                setInvitationCode(e.target.value);
                if (e.target.value) {
                  validateInvitationCode(e.target.value);
                }
              }}
              placeholder="Enter your invitation code"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#13ead9] focus:border-transparent"
            />
          </div>
        )}

        <div className="space-y-4">
          {invitationCode && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={signUpAndJoin}
              disabled={signing || !formData.name || !formData.email || !formData.password || !formData.confirmPassword}
            >
              {signing ? 'Creating Account...' : 'Sign Up & Join Company'}
            </Button>
          )}
          
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
        </div>

        {companyInfo && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <h3 className="text-sm font-semibold text-green-800 mb-2">Company Details</h3>
            <div className="text-sm text-green-700 space-y-1">
              {companyInfo.industry && <p><strong>Industry:</strong> {companyInfo.industry}</p>}
              {companyInfo.headquarters && <p><strong>Location:</strong> {companyInfo.headquarters}</p>}
              {companyInfo.description && <p><strong>About:</strong> {companyInfo.description}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}