'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface FormData {
  companyName: string;
  companyNameAr: string;
  description: string;
  industry: string;
  companySize: string;
  website: string;
  logo: File | null;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone: string;
  adminPosition: string;
}

interface CompanyInfoStepProps {
  locale: string;
  data: FormData;
  onUpdate: (data: Partial<FormData>) => void;
  onNext: () => void;
}

export default function CompanyInfoStep({ locale, data, onUpdate, onNext }: CompanyInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const t = useTranslations('businessSignup.companyInfo');

  const industries = [
    'technology', 'healthcare', 'finance', 'education', 'retail', 
    'manufacturing', 'consulting', 'media', 'nonprofit', 'other'
  ];

  const companySizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ logo: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    if (!data.companyName.trim()) {
      newErrors.companyName = t('validation.companyNameRequired');
    }
    if (!data.industry) {
      newErrors.industry = t('validation.industryRequired');
    }
    if (!data.companySize) {
      newErrors.companySize = t('validation.companySizeRequired');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    onUpdate({ [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className={`${locale === 'ar' ? 'text-right' : 'text-left'}`}>
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">{/* The rest stays the same */}
        {/* Left Column */}
        <div className="space-y-8">
          {/* Company Name */}
          <div className="space-y-4">
            <label className={`text-sm font-bold text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block tracking-wide`}>
              {t('companyNameLabel')} <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={data.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder={t('companyNamePlaceholder')}
              className={`h-14 text-base ${locale === 'ar' ? 'text-right' : 'text-left'} ${errors.companyName ? 'border-destructive' : ''} focus:ring-2 focus:ring-primary/20`}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive font-medium">{errors.companyName}</p>
            )}
          </div>

          {/* Company Name Arabic */}
          <div className="space-y-4">
            <label className={`text-sm font-bold text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block tracking-wide`}>
              {t('companyNameArLabel')} <span className="text-muted-foreground font-normal">({t('optional')})</span>
            </label>
            <Input
              type="text"
              value={data.companyNameAr}
              onChange={(e) => handleInputChange('companyNameAr', e.target.value)}
              placeholder={t('companyNameArPlaceholder')}
              className="h-14 text-base text-right focus:ring-2 focus:ring-primary/20"
              dir="rtl"
            />
          </div>

          {/* Industry */}
          <div className="space-y-3">
            <label className={`text-sm font-semibold text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
              {t('industryLabel')} <span className="text-destructive">*</span>
            </label>
            <select
              value={data.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className={`w-full h-12 px-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                locale === 'ar' ? 'text-right' : 'text-left'
              } ${errors.industry ? 'border-destructive' : ''}`}
            >
              <option value="">{t('industryPlaceholder')}</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {t(`industries.${industry}`)}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="text-xs text-destructive">{errors.industry}</p>
            )}
          </div>

          {/* Company Size */}
          <div className="space-y-3">
            <label className={`text-sm font-semibold text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
              {t('companySizeLabel')} <span className="text-destructive">*</span>
            </label>
            <select
              value={data.companySize}
              onChange={(e) => handleInputChange('companySize', e.target.value)}
              className={`w-full h-12 px-3 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                locale === 'ar' ? 'text-right' : 'text-left'
              } ${errors.companySize ? 'border-destructive' : ''}`}
            >
              <option value="">{t('companySizePlaceholder')}</option>
              {companySizes.map((size) => (
                <option key={size} value={size}>
                  {size} {locale === 'ar' ? 'موظف' : 'employees'}
                </option>
              ))}
            </select>
            {errors.companySize && (
              <p className="text-xs text-destructive">{errors.companySize}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Website */}
          <div className="space-y-3">
            <label className={`text-sm font-semibold text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
              {t('websiteLabel')} <span className="text-muted-foreground">({t('optional')})</span>
            </label>
            <Input
              type="url"
              value={data.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder={t('websitePlaceholder')}
              className={`h-12 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className={`text-sm font-semibold text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
              {t('descriptionLabel')} <span className="text-muted-foreground">({t('optional')})</span>
            </label>
            <textarea
              value={data.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={4}
              className={`w-full px-4 py-3 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
                locale === 'ar' ? 'text-right' : 'text-left'
              }`}
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-3">
            <label className={`text-sm font-semibold text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
              {t('logoLabel')} <span className="text-muted-foreground">({t('optional')})</span>
            </label>
            
            <div className="flex items-start gap-4">
              {/* Logo Preview */}
              <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              
              {/* File Input */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t('logoHint')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-8 border-t border-border/50">
        <Button
          onClick={validateAndNext}
          size="lg"
          className="px-10 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {t('continue')}
          <svg className={`w-5 h-5 ml-3 ${locale === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}