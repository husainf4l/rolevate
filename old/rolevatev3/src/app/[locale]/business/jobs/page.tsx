import { getTranslations } from 'next-intl/server';
import BusinessJobsClient from '@/components/business/business-jobs-client';

interface BusinessJobsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: BusinessJobsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('business.jobs');
  
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function BusinessJobsPage({
  params,
  searchParams
}: BusinessJobsPageProps) {
  const { locale } = await params;
  const search = await searchParams;

  return <BusinessJobsClient locale={locale} searchParams={search} />;
}