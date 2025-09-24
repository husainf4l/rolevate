'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface AdminAccountStepProps {
  locale: string;
  data: FormData;
  onUpdate: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function AdminAccountStep({ locale, data, onUpdate, onNext, onBack }: AdminAccountStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  
  const t = useTranslations('businessSignup.adminAccount');

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    if (!data.adminName.trim()) {
      newErrors.adminName = t('validation.nameRequired');
    }
    if (!data.adminEmail.trim()) {
      newErrors.adminEmail = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(data.adminEmail)) {
      newErrors.adminEmail = t('validation.emailInvalid');
    }
    if (!data.adminPassword) {
      newErrors.adminPassword = t('validation.passwordRequired');
    } else if (data.adminPassword.length < 8) {
      newErrors.adminPassword = t('validation.passwordMinLength');
    }
    if (!data.adminPosition.trim()) {
      newErrors.adminPosition = t('validation.positionRequired');
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
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {t('subtitle', { companyName: data.companyName })}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-8">
        {/* Name and Position Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Name */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">
              {t('nameLabel')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={data.adminName}
              onChange={(e) => handleInputChange('adminName', e.target.value)}
              placeholder={t('namePlaceholder')}
              className={`h-12 text-base transition-colors ${
                errors.adminName 
                  ? 'border-red-500 focus-visible:ring-red-500' 
                  : 'border-border focus-visible:ring-ring'
              }`}
            />
            {errors.adminName && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{errors.adminName}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Admin Position */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">
              {t('positionLabel')} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={data.adminPosition}
              onChange={(e) => handleInputChange('adminPosition', e.target.value)}
              placeholder={t('positionPlaceholder')}
              className={`h-12 text-base transition-colors ${
                errors.adminPosition 
                  ? 'border-red-500 focus-visible:ring-red-500' 
                  : 'border-border focus-visible:ring-ring'
              }`}
            />
            {errors.adminPosition && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{errors.adminPosition}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground">
            {t('emailLabel')} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            value={data.adminEmail}
            onChange={(e) => handleInputChange('adminEmail', e.target.value)}
            placeholder={t('emailPlaceholder')}
            className={`h-12 text-base transition-colors ${
              errors.adminEmail 
                ? 'border-red-500 focus-visible:ring-red-500' 
                : 'border-border focus-visible:ring-ring'
            }`}
          />
          {errors.adminEmail && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">{errors.adminEmail}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Password */}
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground">
            {t('passwordLabel')} <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={data.adminPassword}
              onChange={(e) => handleInputChange('adminPassword', e.target.value)}
              placeholder={t('passwordPlaceholder')}
              className={`h-12 text-base pr-12 transition-colors ${
                errors.adminPassword 
                  ? 'border-red-500 focus-visible:ring-red-500' 
                  : 'border-border focus-visible:ring-ring'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <span className="text-sm">Hide</span>
              ) : (
                <span className="text-sm">Show</span>
              )}
            </button>
          </div>
          {errors.adminPassword && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">{errors.adminPassword}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            {t('passwordHint')}
          </p>
        </div>

        {/* Phone */}
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground">
            {t('phoneLabel')} <span className="text-muted-foreground text-sm font-normal">({t('optional')})</span>
          </Label>
          <Input
            type="tel"
            value={data.adminPhone}
            onChange={(e) => handleInputChange('adminPhone', e.target.value)}
            placeholder={t('phonePlaceholder')}
            className="h-12 text-base"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="px-8 py-3 text-base font-medium"
        >
          {t('back')}
        </Button>
        
        <Button
          onClick={validateAndNext}
          size="lg"
          className="px-8 py-3 text-base font-medium"
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}