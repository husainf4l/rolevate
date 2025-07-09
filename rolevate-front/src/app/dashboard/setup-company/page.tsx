'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/common/logo';

// --- ENUMS & CONSTANTS ---

export enum Industry {
  TECHNOLOGY = 'TECHNOLOGY',
  HEALTHCARE = 'HEALTHCARE',
  FINANCE = 'FINANCE',
  EDUCATION = 'EDUCATION',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  CONSTRUCTION = 'CONSTRUCTION',
  TRANSPORTATION = 'TRANSPORTATION',
  HOSPITALITY = 'HOSPITALITY',
  CONSULTING = 'CONSULTING',
  MARKETING = 'MARKETING',
  REAL_ESTATE = 'REAL_ESTATE',
  MEDIA = 'MEDIA',
  AGRICULTURE = 'AGRICULTURE',
  ENERGY = 'ENERGY',
  GOVERNMENT = 'GOVERNMENT',
  NON_PROFIT = 'NON_PROFIT',
  OTHER = 'OTHER'
}
export enum Country {
  AE = 'AE', SA = 'SA', QA = 'QA', KW = 'KW', BH = 'BH', OM = 'OM', EG = 'EG',
  JO = 'JO', LB = 'LB', SY = 'SY', IQ = 'IQ', YE = 'YE', MA = 'MA', TN = 'TN',
  DZ = 'DZ', LY = 'LY', SD = 'SD', SO = 'SO', DJ = 'DJ', KM = 'KM',
}

const countryNames: Record<Country, string> = {
  AE: 'United Arab Emirates', SA: 'Saudi Arabia', QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman',
  EG: 'Egypt', JO: 'Jordan', LB: 'Lebanon', SY: 'Syria', IQ: 'Iraq', YE: 'Yemen',
  MA: 'Morocco', TN: 'Tunisia', DZ: 'Algeria', LY: 'Libya', SD: 'Sudan', SO: 'Somalia', DJ: 'Djibouti', KM: 'Comoros',
};
const industryNames: Record<Industry, string> = {
  TECHNOLOGY: 'Technology', HEALTHCARE: 'Healthcare', FINANCE: 'Finance', EDUCATION: 'Education',
  MANUFACTURING: 'Manufacturing', RETAIL: 'Retail', CONSTRUCTION: 'Construction', TRANSPORTATION: 'Transportation',
  HOSPITALITY: 'Hospitality', CONSULTING: 'Consulting', MARKETING: 'Marketing', REAL_ESTATE: 'Real Estate',
  MEDIA: 'Media', AGRICULTURE: 'Agriculture', ENERGY: 'Energy', GOVERNMENT: 'Government', NON_PROFIT: 'Non-Profit', OTHER: 'Other'
};
const sizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

// --- UTILITY COMPONENTS ---

function SelectInput<T extends string>({
  id, label, options, value, onChange, required = false
}: {
  id: string, label: string, options: Record<T, string> | { value: string, label: string }[],
  value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, required?: boolean
}) {
  const opts = Array.isArray(options)
    ? options
    : Object.entries(options).map(([value, label]) => ({ value, label }));
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select
        id={id}
        name={id}
        required={required}
        value={value}
        onChange={onChange}
        className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] focus:ring-[#13ead9] text-sm"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {opts.map(opt => (
          <option key={opt.value} value={opt.value}>{String(opt.label)}</option>
        ))}
      </select>
    </div>
  );
}

// --- FORMS ---

function CreateCompanyForm({
  loading, companyData, setCompanyData, onSubmit, isGeneratingDescription, generateDescription, descriptionError
}: any) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
          <input
            id="name"
            required
            value={companyData.name}
            onChange={e => setCompanyData((d: any) => ({ ...d, name: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
            placeholder="Enter your company name"
          />
        </div>
        <SelectInput
          id="industry"
          label="Industry *"
          options={industryNames}
          required
          value={companyData.industry}
          onChange={e => setCompanyData((d: any) => ({ ...d, industry: e.target.value }))}
        />
        <SelectInput
          id="size"
          label="Company Size *"
          options={sizeOptions}
          required
          value={companyData.size}
          onChange={e => setCompanyData((d: any) => ({ ...d, size: e.target.value }))}
        />
        <SelectInput
          id="country"
          label="Country *"
          options={countryNames}
          required
          value={companyData.country}
          onChange={e => setCompanyData((d: any) => ({ ...d, country: e.target.value }))}
        />
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
          <input
            id="city"
            required
            value={companyData.city}
            onChange={e => setCompanyData((d: any) => ({ ...d, city: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
            placeholder="City"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1.5">Street Address *</label>
          <input
            id="street"
            required
            value={companyData.street}
            onChange={e => setCompanyData((d: any) => ({ ...d, street: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
            placeholder="Street address"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
          <input
            id="phone"
            required
            value={companyData.phone}
            onChange={e => setCompanyData((d: any) => ({ ...d, phone: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
            placeholder="Phone number"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
          <input
            id="website"
            type="url"
            value={companyData.website}
            onChange={e => setCompanyData((d: any) => ({ ...d, website: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
            placeholder="https://www.yourcompany.com"
          />
        </div>
        {/* Description w/ AI */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Company Description
            </label>
            <button
              type="button"
              onClick={generateDescription}
              disabled={isGeneratingDescription || !companyData.industry}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-lg disabled:opacity-50"
            >
              {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
            </button>
          </div>
          {descriptionError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs font-medium">{descriptionError}</p>
            </div>
          )}
          <textarea
            id="description"
            rows={3}
            value={companyData.description}
            onChange={e => setCompanyData((d: any) => ({ ...d, description: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] resize-none text-sm"
            placeholder="Brief description of your company and what you do..."
            maxLength={400}
          />
          <div className="text-xs text-gray-400 font-medium text-right">{companyData.description.length}/400</div>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-[#13ead9] to-[#0891b2] py-3 px-6 text-white font-semibold hover:scale-[1.01] transition-all text-sm disabled:opacity-60"
      >
        {loading ? 'Creating Company...' : 'Create Company'}
      </button>
    </form>
  );
}

function JoinCompanyForm({ loading, invitationCode, setInvitationCode, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-5">
        <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-1.5">
          Invitation Code *
        </label>
        <input
          id="invitationCode"
          required
          value={invitationCode}
          onChange={e => setInvitationCode(e.target.value)}
          className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
          placeholder="Enter your invitation code"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-[#13ead9] to-[#0891b2] py-3 px-6 text-white font-semibold hover:scale-[1.01] transition-all text-sm disabled:opacity-60"
      >
        {loading ? 'Joining Company...' : 'Join Company'}
      </button>
    </form>
  );
}

// --- MAIN PAGE ---

export default function SetupCompanyPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const router = useRouter();

  // Page fade-in effect
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Company create state
  const [companyData, setCompanyData] = useState({
    name: '', industry: '', size: '', website: '', description: '',
    country: '', city: '', street: '', phone: ''
  });
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  // Join code
  const [invitationCode, setInvitationCode] = useState('');

  // AI Description
  const generateDescription = async () => {
    setIsGeneratingDescription(true); setDescriptionError(null);
    try {
      const response = await fetch('/api/aiautocomplete/companydescription', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          industry: companyData.industry, location: companyData.city, country: companyData.country,
          numberOfEmployees: Number(companyData.size.split('-')[0]) || 0, currentDescription: companyData.description
        })
      });
      if (!response.ok) throw new Error('Failed to generate description');
      const data = await response.json();
      setCompanyData((prev: any) => ({ ...prev, description: data.generatedDescription }));
    } catch (error: any) {
      setDescriptionError(error.message || 'Failed to generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Handlers
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      // Call API here
      router.replace('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };
  const handleJoinCompany = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      // Call API here
      router.replace('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to join company');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13ead9] mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">Setting up your workspace...</p>
      </div>
    </div>
  );

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-white/95 backdrop-blur-lg border-b border-gray-100">
          <Logo size={32} />
          <button
            onClick={() => router.push('/login')}
            className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100/80 text-sm"
          >
            <span className="font-medium">Back</span>
          </button>
        </div>
        {/* Main Form */}
        <div className="flex flex-col justify-center lg:col-span-8 px-4 sm:px-8 pt-20 pb-8 min-h-screen">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="text-center mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Company Setup
              </h1>
              <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Create your company profile or join an existing organization to get started.
              </p>
            </div>
            <div className="flex bg-gray-100/90 rounded-xl p-1 mb-6 max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm ${activeTab === 'create'
                  ? 'bg-white text-[#0891b2] shadow-md' : 'text-gray-600 hover:bg-white/40'}`}
              >Create Company</button>
              <button
                onClick={() => setActiveTab('join')}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm ${activeTab === 'join'
                  ? 'bg-white text-[#0891b2] shadow-md' : 'text-gray-600 hover:bg-white/40'}`}
              >Join Existing Company</button>
            </div>
            {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">{error}</div>}
            {activeTab === 'create' ? (
              <CreateCompanyForm
                loading={loading}
                companyData={companyData}
                setCompanyData={setCompanyData}
                onSubmit={handleCreateCompany}
                isGeneratingDescription={isGeneratingDescription}
                generateDescription={generateDescription}
                descriptionError={descriptionError}
              />
            ) : (
              <JoinCompanyForm
                loading={loading}
                invitationCode={invitationCode}
                setInvitationCode={setInvitationCode}
                onSubmit={handleJoinCompany}
              />
            )}
          </div>
        </div>
        {/* Illustration */}
        <div className="hidden lg:flex items-center justify-center lg:col-span-4 bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="relative w-80 h-64 lg:w-[28rem] lg:h-[20rem] group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#13ead9]/10 via-white/20 to-[#0891b2]/10 rounded-[2rem] shadow-xl backdrop-blur-sm border border-white/30 group-hover:shadow-2xl"></div>
            <div className="absolute inset-3 rounded-[1.5rem] overflow-hidden shadow-inner ring-1 ring-white/20">
              <img
                src="/images/hero.png"
                alt="Setup Illustration"
                className="object-cover rounded-[1.5rem] group-hover:scale-105 transition-transform duration-700"
                style={{ width: '100%', height: '100%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent rounded-[1.5rem]"></div>
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-[#13ead9] to-[#0891b2] rounded-full shadow-xl animate-pulse flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-[#0891b2] to-[#13ead9] rounded-full shadow-xl animate-pulse delay-1000 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
