import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, getDirection, type Locale } from '@/i18n/config';
import { Providers } from '@/providers';
import { Inter } from 'next/font/google';
import { Noto_Sans_Arabic } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansArabic = Noto_Sans_Arabic({ 
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  display: 'swap',
});

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
  const direction = getDirection(locale as Locale);
  const isArabic = locale === 'ar';

  return (
    <html 
      lang={locale} 
      dir={direction} 
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansArabic.variable}`}
    >
      <body className={isArabic ? 'font-arabic' : 'font-sans'}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}