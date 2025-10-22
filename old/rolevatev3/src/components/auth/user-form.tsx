'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  position: string;
}

interface UserFormProps {
  locale: string;
  organizationId: string;
  organizationName: string;
  onSubmit: (userData: UserData) => void;
  onBack: () => void;
}

export default function UserForm({ locale, organizationId, organizationName, onSubmit, onBack }: UserFormProps) {
  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    position: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<UserData>>({});

  const t = useTranslations('employerSignup.user');

  const validateForm = () => {
    const newErrors: Partial<UserData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.firstNameRequired');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.lastNameRequired');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }
    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordMinLength');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create user under the organization
      const userData = {
        ...formData,
        organizationId
      };

      const response = await fetch('/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      onSubmit(formData);
    } catch (error) {
      console.error('Error creating user:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${locale === 'ar' ? 'text-right' : 'text-left'}`}>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('subtitle', { organizationName })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
              {t('firstNameLabel')} <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder={t('firstNamePlaceholder')}
              className={`${locale === 'ar' ? 'text-right' : 'text-left'} ${errors.firstName ? 'border-destructive' : ''}`}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
              {t('lastNameLabel')} <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder={t('lastNamePlaceholder')}
              className={`${locale === 'ar' ? 'text-right' : 'text-left'} ${errors.lastName ? 'border-destructive' : ''}`}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
            {t('emailLabel')} <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder={t('emailPlaceholder')}
            className={`${locale === 'ar' ? 'text-right' : 'text-left'} ${errors.email ? 'border-destructive' : ''}`}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
            {t('phoneLabel')} <span className="text-muted-foreground">({t('optional')})</span>
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder={t('phonePlaceholder')}
            className={locale === 'ar' ? 'text-right' : 'text-left'}
          />
        </div>

        {/* Position */}
        <div className="space-y-2">
          <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
            {t('positionLabel')} <span className="text-muted-foreground">({t('optional')})</span>
          </label>
          <Input
            type="text"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            placeholder={t('positionPlaceholder')}
            className={locale === 'ar' ? 'text-right' : 'text-left'}
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
            {t('passwordLabel')} <span className="text-destructive">*</span>
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder={t('passwordPlaceholder')}
            className={`${locale === 'ar' ? 'text-right' : 'text-left'} ${errors.password ? 'border-destructive' : ''}`}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t('passwordHint')}
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
            {t('confirmPasswordLabel')} <span className="text-destructive">*</span>
          </label>
          <Input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder={t('confirmPasswordPlaceholder')}
            className={`${locale === 'ar' ? 'text-right' : 'text-left'} ${errors.confirmPassword ? 'border-destructive' : ''}`}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            {t('back')}
          </Button>
          
          <Button
            type="submit"
            className="w-full sm:flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t('creating')}
              </div>
            ) : (
              t('complete')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}