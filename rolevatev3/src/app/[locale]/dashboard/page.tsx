import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Dashboard - Rolevate',
  description: 'Your personal recruitment dashboard',
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        <div className="text-muted-foreground">
          <p>{t('welcome')}</p>
        </div>
      </div>
    </div>
  );
}