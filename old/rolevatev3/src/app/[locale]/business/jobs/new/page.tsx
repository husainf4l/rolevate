'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import BusinessLayout from '@/components/layout/business-layout';
import { JobPostingWizard } from '@/components/business/job-posting';

interface NewJobPageProps {
  params: Promise<{ locale: string }>;
}

export default function NewJobPage({ params }: NewJobPageProps) {
  const [locale, setLocale] = useState<string>('en');
  const router = useRouter();

  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  const handleBack = () => {
    router.push('/business/jobs');
  };

  return (
    <BusinessLayout locale={locale}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {locale === 'ar' ? 'نشر وظيفة جديدة' : 'Post New Job'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {locale === 'ar'
              ? 'أضف تفاصيل الوظيفة لجذب أفضل المرشحين'
              : 'Add job details to attract the best candidates'
            }
          </p>
        </div>

        {/* Job Posting Wizard */}
        <JobPostingWizard locale={locale} onBack={handleBack} />
      </div>
    </BusinessLayout>
  );
}