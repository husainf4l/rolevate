import { getTranslations } from 'next-intl/server';
import CreateJobWizard from '@/components/business/create-job-wizard';

interface CreateJobPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CreateJobPageProps) {
  const { locale } = await params;
  const t = await getTranslations('business.jobs.create');
  
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function CreateJobPage({ params }: CreateJobPageProps) {
  const { locale } = await params;

  return <CreateJobWizard locale={locale} />;
}