'use client';

import { useEffect } from 'react';
import { getDirection, type Locale } from '@/i18n/config';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';

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

interface LocaleAttributesProps {
  locale: Locale;
}

export function LocaleAttributes({ locale }: LocaleAttributesProps) {
  useEffect(() => {
    const direction = getDirection(locale);
    const isArabic = locale === 'ar';

    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.documentElement.className = `${inter.variable} ${notoSansArabic.variable}`;
    document.body.className = isArabic ? 'font-arabic' : 'font-sans';
  }, [locale]);

  return null;
}