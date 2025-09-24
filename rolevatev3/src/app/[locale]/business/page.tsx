import { getTranslations } from 'next-intl/server';
import BusinessLayout from '@/components/layout/business-layout';
import BusinessDashboardClient from '@/components/auth/business-dashboard-client';

export default async function BusinessPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <BusinessLayout locale={locale}>
      <div></div>
    </BusinessLayout>
  );
}
