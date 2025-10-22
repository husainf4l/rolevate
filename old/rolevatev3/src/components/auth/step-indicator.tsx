'use client';

import { Progress } from '@/components/ui/progress';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  locale: string;
}

export default function StepIndicator({ currentStep, totalSteps, locale }: StepIndicatorProps) {
  const steps = [
    {
      number: 1,
      title: locale === 'ar' ? 'معلومات الشركة' : 'Company Information',
      description: locale === 'ar' ? 'البيانات الأساسية للمؤسسة' : 'Basic company details'
    },
    {
      number: 2,
      title: locale === 'ar' ? 'حساب المدير' : 'Admin Account',
      description: locale === 'ar' ? 'إعداد حساب الإدارة' : 'Setup admin account'
    },
    {
      number: 3,
      title: locale === 'ar' ? 'مراجعة وإنهاء' : 'Review & Complete',
      description: locale === 'ar' ? 'مراجعة نهائية وإتمام التسجيل' : 'Final review and completion'
    }
  ];

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-muted-foreground">
            {locale === 'ar' ? 'التقدم' : 'Progress'}
          </span>
          <span className="text-muted-foreground">
            {currentStep} {locale === 'ar' ? 'من' : 'of'} {totalSteps}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-1.5" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center space-y-1 flex-1">
            {/* Step Circle */}
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
              ${step.number < currentStep 
                ? 'bg-primary text-primary-foreground' 
                : step.number === currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }
            `}>
              {step.number < currentStep ? '✓' : step.number}
            </div>
            
            {/* Step Title - Only show on larger screens */}
            <p className={`text-xs font-medium text-center hidden sm:block max-w-20 ${
              step.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}