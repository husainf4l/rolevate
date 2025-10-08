import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1.5">
            Company Name *
          </Label>
          <Input
            id="name"
            required
            value={companyData.name}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, name: e.target.value }))}
            placeholder="Enter your company name"
          />
        </div>

        <div>
          <Label htmlFor="industry" className="text-sm font-medium text-gray-700 mb-1.5">
            Industry *
          </Label>
          <Select
            value={companyData.industry}
            onValueChange={(value) => setCompanyData((d: CompanyData) => ({ ...d, industry: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(industryNames).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="size" className="text-sm font-medium text-gray-700 mb-1.5">
            Company Size *
          </Label>
          <Select
            value={companyData.size}
            onValueChange={(value) => setCompanyData((d: CompanyData) => ({ ...d, size: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {sizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-1.5">
            Country *
          </Label>
          <Select
            value={companyData.country}
            onValueChange={(value) => setCompanyData((d: CompanyData) => ({ ...d, country: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(countryNames).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-1.5">
            City *
          </Label>
          <Input
            id="city"
            required
            value={companyData.city}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, city: e.target.value }))}
            placeholder="City"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="street" className="text-sm font-medium text-gray-700 mb-1.5">
            Street Address *
          </Label>
          <Input
            id="street"
            required
            value={companyData.street}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, street: e.target.value }))}
            placeholder="Street address"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1.5">
            Phone Number *
          </Label>
          <div className="flex">
            <Select
              value={companyData.country}
              onValueChange={(value) => setCompanyData((d: CompanyData) => ({ ...d, country: value }))}
            >
              <SelectTrigger className="w-20 rounded-r-none border-r-0">
                <SelectValue placeholder="+" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(countryCodes).map(([code, phoneCode]) => (
                  <SelectItem key={code} value={code}>
                    {phoneCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="phone"
              required
              value={companyData.phone}
              onChange={e => setCompanyData((d: CompanyData) => ({ ...d, phone: e.target.value }))}
              placeholder="Phone number"
              className="rounded-l-none"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1.5">
            Company Email *
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={companyData.email}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, email: e.target.value }))}
            placeholder="contact@yourcompany.com"
          />
        </div>

        <div>
          <Label htmlFor="website" className="text-sm font-medium text-gray-700 mb-1.5">
            Website
          </Label>
          <Input
            id="website"
            type="url"
            value={companyData.website}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, website: e.target.value }))}
            placeholder="https://www.yourcompany.com"
          />
        </div>
        
        {/* Description w/ AI */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Company Description
            </Label>
            <Button
              type="button"
              onClick={generateDescription}
              disabled={isGeneratingDescription || !companyData.industry}
              variant="outline"
              size="sm"
            >
              {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
            </Button>
          </div>
          {descriptionError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs font-medium">{descriptionError}</p>
            </div>
          )}
          <Textarea
            id="description"
            rows={3}
            value={companyData.description}
            onChange={e => setCompanyData((d: CompanyData) => ({ ...d, description: e.target.value }))}
            placeholder="Brief description of your company and what you do..."
            maxLength={400}
            className="resize-none"
          />
          <div className="text-xs text-gray-400 font-medium text-right">
            {companyData.description.length}/400
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Creating Company...' : 'Create Company'}
      </Button>
    </form>
  );
}

