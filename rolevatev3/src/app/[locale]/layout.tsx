import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { Providers } from '@/providers';
import { LocaleAttributes } from '@/components/locale-attributes';

export const metadata: Metadata = {
  title: {
    default: 'Rolevate',
    template: '%s | Rolevate'
  },
  description: 'AI-powered recruitment platform for the Middle East. Land your dream job faster with intelligent career matching.',
  keywords: ['jobs', 'recruitment', 'AI', 'Middle East', 'careers'],
  authors: [{ name: 'Rolevate' }],
  openGraph: {
    title: 'Rolevate - AI-Powered Recruitment',
    description: 'Transform your job search with AI-powered interviews and intelligent career matching.',
    type: 'website',
  },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <LocaleAttributes locale={locale as Locale} />
      <Providers>
        {children}
      </Providers>
    </NextIntlClientProvider>
  );
}