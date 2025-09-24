import { getTranslations } from 'next-intl/server';
import BusinessLayout from '@/components/layout/business-layout';
import NotificationsContent from '@/components/business/notifications-content';

export default async function NotificationsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <BusinessLayout locale={locale}>
      <NotificationsContent locale={locale} />
    </BusinessLayout>
  );
}