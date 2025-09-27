'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface OrganizationData {
  name: string;
  nameAr: string;
  description: string;
  logo: File | null;
}

interface OrganizationFormProps {
  locale: string;
  onSubmit: (data: OrganizationData, organizationId: string) => void;
  initialData?: OrganizationData;
}

export default function OrganizationForm({ locale, onSubmit, initialData }: OrganizationFormProps) {
  const [formData, setFormData] = useState<OrganizationData>({
    name: initialData?.name || '',
    nameAr: initialData?.nameAr || '',
    description: initialData?.description || '',
    logo: initialData?.logo || null
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = useTranslations('employerSignup.organization');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData for API submission
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      if (formData.nameAr.trim()) {
        apiFormData.append('nameAr', formData.nameAr);
      }
      if (formData.description.trim()) {
        apiFormData.append('description', formData.description);
      }
      if (formData.logo) {
        apiFormData.append('logo', formData.logo);
      }

      const response = await fetch('/organizations/register', {
        method: 'POST',
        body: apiFormData
      });

      if (!response.ok) {
        throw new Error('Failed to create organization');
      }

      const result = await response.json();
      const organizationId = result.id || `org_${Date.now()}`;
      
      onSubmit(formData, organizationId);
    } catch (error) {
      console.error('Error creating organization:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${locale === 'ar' ? 'text-right' : 'text-left'}`}>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Organization Name */}
        <div className="space-y-2">
          <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
            {t('nameLabel')} <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('namePlaceholder')}
            required
            className={locale === 'ar' ? 'text-right' : 'text-left'}
          />
        </div>

        {/* Organization Name (Arabic) */}
        <div className="space-y-2">
          <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
            {t('nameArLabel')} <span className="text-muted-foreground">({t('optional')})</span>
          </label>
          <Input
            type="text"
            value={formData.nameAr}
            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
            placeholder={t('nameArPlaceholder')}
            className="text-right"
            dir="rtl"
          />
        </div>

        {/* Arabic Description */}
        <div className="space-y-2">
          <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
            {t('descriptionLabel')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('descriptionPlaceholder')}
            rows={4}
            className={`w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className={`text-sm font-medium text-foreground ${locale === 'ar' ? 'text-right' : 'text-left'} block`}>
            {t('logoLabel')} <span className="text-muted-foreground">({t('optional')})</span>
          </label>
          
          <div className="flex items-center gap-4">
            {/* Logo Preview */}
            {logoPreview && (
              <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            {/* File Input */}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('logoHint')}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!formData.name.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {t('creating')}
            </div>
          ) : (
            t('continue')
          )}
        </Button>
      </form>
    </div>
  );
}