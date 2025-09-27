'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuthContext } from '@/providers/auth-provider';
import StepIndicator from './step-indicator';
import CompanyInfoStep from './steps/company-info-step';
import AdminAccountStep from './steps/admin-account-step';
import ReviewStep from './steps/review-step';

interface BusinessSignupFormProps {
  locale: string;
}

interface FormData {
  // Company info
  companyName: string;
  companyNameAr: string;
  description: string;
  industry: string;
  companySize: string;
  website: string;
  logo: File | null;
  
  // Admin account
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone: string;
  adminPosition: string;
}

export default function BusinessSignupForm({ locale }: BusinessSignupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  // const router = useRouter();
  const { registerBusiness } = useAuthContext();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyNameAr: '',
    description: '',
    industry: '',
    companySize: '',
    website: '',
    logo: null,
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
    adminPosition: ''
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpdateData = (data: Partial<FormData>) => {
    setFormData({ ...formData, ...data });
  };

  const handleSubmit = async () => {
    try {
      const result = await registerBusiness({
        companyName: formData.companyName,
        nameAr: formData.companyNameAr || undefined,
        companyDescription: formData.description || undefined,
        website: formData.website || undefined,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        adminName: formData.adminName,
        logo: formData.logo || undefined,
      });

      if (!result.success) {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      // TODO: Show error message to user
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyInfoStep
            locale={locale}
            data={formData}
            onUpdate={handleUpdateData}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <AdminAccountStep
            locale={locale}
            data={formData}
            onUpdate={handleUpdateData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ReviewStep
            locale={locale}
            data={formData}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        {/* Main Form Card */}
        <Card className="relative overflow-hidden border border-border shadow-sm">
          {/* Header with Step Indicator */}
          <div className="border-b border-border p-6 bg-muted/20">
            <StepIndicator 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
              locale={locale}
            />
          </div>
          
          {/* Content */}
          <div className="p-8 lg:p-12">
            {renderCurrentStep()}
          </div>
        </Card>
      </div>
    </div>
  );
}