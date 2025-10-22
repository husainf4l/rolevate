export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية'
};

export const localeCodes: Record<Locale, string> = {
  en: 'EN',
  ar: 'AR'
};

export const localeConfig = {
  locales,
  defaultLocale,
  localeNames,
  localeCodes,
  localePrefix: 'as-needed' as const,
  alternateLinks: true,
  localeDetection: true
};

export const rtlLocales: Locale[] = ['ar'];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export const currencyByLocale: Record<Locale, string> = {
  en: 'USD',
  ar: 'SAR'
};

export const dateFormats: Record<Locale, Intl.DateTimeFormatOptions> = {
  en: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  ar: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory'
  }
};

export const numberFormats: Record<Locale, Intl.NumberFormatOptions> = {
  en: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  ar: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  }
};

export const timeZones = {
  jordan: 'Asia/Amman',
  saudiArabia: 'Asia/Riyadh',
  uae: 'Asia/Dubai',
  qatar: 'Asia/Qatar'
};

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}