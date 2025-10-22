import { type Locale, getDirection, currencyByLocale, timeZones } from './config';

export function formatCurrency(
  amount: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyByLocale[locale],
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

export function formatNumber(
  number: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);
}

export function formatDate(
  date: Date | string | number,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObject = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObject);
}

export function formatRelativeTime(
  date: Date | string | number,
  locale: Locale
): string {
  const dateObject = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInMilliseconds = dateObject.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffInDays) < 1) {
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    if (Math.abs(diffInHours) < 1) {
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      return rtf.format(diffInMinutes, 'minute');
    }
    return rtf.format(diffInHours, 'hour');
  }

  if (Math.abs(diffInDays) < 7) {
    return rtf.format(diffInDays, 'day');
  }

  if (Math.abs(diffInDays) < 30) {
    const diffInWeeks = Math.floor(diffInDays / 7);
    return rtf.format(diffInWeeks, 'week');
  }

  if (Math.abs(diffInDays) < 365) {
    const diffInMonths = Math.floor(diffInDays / 30);
    return rtf.format(diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return rtf.format(diffInYears, 'year');
}

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return getDirection(locale);
}

export function getPageTitle(title: string, locale: Locale): string {
  const baseTitle = 'Rolevate';
  return locale === 'ar' ? `${title} | ${baseTitle}` : `${title} | ${baseTitle}`;
}

export function getCountryTimeZone(country: keyof typeof timeZones): string {
  return timeZones[country];
}

export function formatPhoneNumber(phone: string, locale: Locale): string {
  try {
    // Basic phone number formatting based on locale
    if (locale === 'ar') {
      // Format for Middle East countries
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 8) {
        return cleaned.replace(/(\d{4})(\d{4})/, '$1 $2');
      }
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      }
      if (cleaned.length === 12) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
      }
    }

    // Default formatting for English
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }

    return phone;
  } catch {
    return phone;
  }
}

export function validateLocale(locale: string): locale is Locale {
  return ['en', 'ar'].includes(locale);
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ar' : 'en';
}

export function createLocalizedSlug(text: string, locale: Locale): string {
  if (locale === 'ar') {
    // For Arabic, we might want to transliterate or use a different approach
    return text
      .trim()
      .toLowerCase()
      .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '') // Remove Arabic characters
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}