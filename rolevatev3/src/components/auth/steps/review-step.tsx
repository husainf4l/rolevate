'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface ReviewStepProps {
  locale: string;
  data: FormData;
  onSubmit: () => Promise<void>;
  onBack: () => void;
}

export default function ReviewStep({ locale, data, onSubmit, onBack }: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const t = useTranslations('businessSignup.review');

  // Generate logo preview if logo exists
  React.useEffect(() => {
    if (data.logo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(data.logo);
    }
  }, [data.logo]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIndustryDisplay = (industry: string) => {
    return t(`industries.${industry}`, { defaultValue: industry });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Review Cards */}
      <div className="space-y-8">
        {/* Company Information Card */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-foreground">
                {t('companyInfoTitle')}
              </h2>
            </div>
            
            {/* Company Header with Logo */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Avatar className="w-16 h-16">
                <AvatarImage src={logoPreview || undefined} alt="Company logo" />
                <AvatarFallback className="text-lg font-medium">
                  {data.companyName ? data.companyName.charAt(0).toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-foreground">{data.companyName}</h3>
                {data.companyNameAr && (
                  <p className="text-sm text-muted-foreground" dir="rtl">{data.companyNameAr}</p>
                )}
              </div>
            </div>

            {/* Company Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <p className="text-base text-foreground">{getIndustryDisplay(data.industry)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Company Size</p>
                <p className="text-base text-foreground">
                  {data.companySize} {locale === 'ar' ? 'موظف' : 'employees'}
                </p>
              </div>
              
              {data.website && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Website</p>
                  <p className="text-base text-foreground">{data.website}</p>
                </div>
              )}
            </div>

            {data.description && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-base text-foreground leading-relaxed">{data.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Admin Account Information Card */}
        <Card className="p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-foreground">
              {t('adminAccountTitle')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base text-foreground">{data.adminName}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Position</p>
                <p className="text-base text-foreground">{data.adminPosition}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base text-foreground">{data.adminEmail}</p>
              </div>
              
              {data.adminPhone && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base text-foreground">{data.adminPhone}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Terms Notice */}
        <div className="text-center p-6 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {locale === 'ar' 
              ? 'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا'
              : 'By proceeding, you agree to our Terms of Service and Privacy Policy'
            }
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="px-8 py-3 text-base font-medium"
          disabled={isSubmitting}
        >
          {t('back')}
        </Button>
        
        <Button
          onClick={handleSubmit}
          size="lg"
          className="px-8 py-3 text-base font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </div>
    </div>
  );
}