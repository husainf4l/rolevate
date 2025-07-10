import React from 'react';
import SelectInput from './SelectInput';

export interface CompanyData {
  name: string;
  industry: string;
  size: string;
  website: string;
  email: string;
  description: string;
  country: string;
  city: string;
  street: string;
  phone: string;
}

export const industryNames = {
  TECHNOLOGY: 'Technology', HEALTHCARE: 'Healthcare', FINANCE: 'Finance', EDUCATION: 'Education',
  MANUFACTURING: 'Manufacturing', RETAIL: 'Retail', CONSTRUCTION: 'Construction', TRANSPORTATION: 'Transportation',
  HOSPITALITY: 'Hospitality', CONSULTING: 'Consulting', MARKETING: 'Marketing', REAL_ESTATE: 'Real Estate',
  MEDIA: 'Media', AGRICULTURE: 'Agriculture', ENERGY: 'Energy', GOVERNMENT: 'Government', NON_PROFIT: 'Non-Profit', OTHER: 'Other'
};

export const countryNames = {
  AE: 'United Arab Emirates', SA: 'Saudi Arabia', QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman',
  EG: 'Egypt', JO: 'Jordan', LB: 'Lebanon', SY: 'Syria', IQ: 'Iraq', YE: 'Yemen',
  MA: 'Morocco', TN: 'Tunisia', DZ: 'Algeria', LY: 'Libya', SD: 'Sudan', SO: 'Somalia', DJ: 'Djibouti', KM: 'Comoros',
};

export const countryCodes = {
  AE: '+971', SA: '+966', QA: '+974', KW: '+965', BH: '+973', OM: '+968',
  EG: '+20', JO: '+962', LB: '+961', SY: '+963', IQ: '+964', YE: '+967',
  MA: '+212', TN: '+216', DZ: '+213', LY: '+218', SD: '+249', SO: '+252', DJ: '+253', KM: '+269',
};

export const sizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

interface CreateCompanyFormProps {
  loading: boolean;
  companyData: CompanyData;
  setCompanyData: React.Dispatch<React.SetStateAction<CompanyData>>;
  onSubmit: (e: React.FormEvent) => void;
  isGeneratingDescription: boolean;
  generateDescription: () => void;
  descriptionError: string | null;
}

export default function CreateCompanyForm({
  loading,
  companyData,
  setCompanyData,
  onSubmit,
  isGeneratingDescription,
  generateDescription,
  descriptionError
}: CreateCompanyFormProps) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Company Name *
          </label>
          <input
            id="name"
            required
            value={companyData.name}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, name: e.target.value }))}
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
          onChange={e => setCompanyData((d: CompanyData) => ({ ...d, industry: e.target.value }))}
        />
        
        <SelectInput
          id="size"
          label="Company Size *"
          options={sizeOptions}
          required
          value={companyData.size}
          onChange={e => setCompanyData((d: CompanyData) => ({ ...d, size: e.target.value }))}
        />
        
        <SelectInput
          id="country"
          label="Country *"
          options={countryNames}
          required
          value={companyData.country}
          onChange={e => setCompanyData((d: CompanyData) => ({ ...d, country: e.target.value }))}
        />
        
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1.5">
            City *
          </label>
          <input
            id="city"
            required
            value={companyData.city}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, city: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
            placeholder="City"
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1.5">
            Street Address *
          </label>
          <input
            id="street"
            required
            value={companyData.street}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, street: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
            placeholder="Street address"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number *
          </label>
          <div className="flex">
            <select
              value={companyData.country}
              onChange={e => setCompanyData((d: CompanyData) => ({ ...d, country: e.target.value }))}
              className="flex-shrink-0 rounded-l-lg border border-r-0 border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm w-20"
            >
              <option value="">+</option>
              {Object.entries(countryCodes).map(([code, phoneCode]) => (
                <option key={code} value={code}>
                  {phoneCode}
                </option>
              ))}
            </select>
            <input
              id="phone"
              required
              value={companyData.phone}
              onChange={e => setCompanyData((d: CompanyData) => ({ ...d, phone: e.target.value }))}
              className="flex-1 rounded-r-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
              placeholder="Phone number"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Company Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={companyData.email}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, email: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] text-sm"
            placeholder="contact@yourcompany.com"
          />
        </div>
        
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1.5">
            Website
          </label>
          <input
            id="website"
            type="url"
            value={companyData.website}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, website: e.target.value }))}
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
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, description: e.target.value }))}
            className="block w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-gray-900 shadow-sm focus:border-[#13ead9] resize-none text-sm"
            placeholder="Brief description of your company and what you do..."
            maxLength={400}
          />
          <div className="text-xs text-gray-400 font-medium text-right">
            {companyData.description.length}/400
          </div>
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
