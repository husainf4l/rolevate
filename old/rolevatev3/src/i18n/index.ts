// Core configuration
export {
  locales,
  defaultLocale,
  localeNames,
  localeCodes,
  localeConfig,
  rtlLocales,
  isRTL,
  getDirection,
  currencyByLocale,
  dateFormats,
  numberFormats,
  timeZones,
  type Locale
} from './config';

// Routing
export { routing } from './routing';

// Navigation
export { Link, redirect, usePathname, useRouter, getPathname } from './navigation';

// Utilities
export {
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  getLocaleDirection,
  getPageTitle,
  getCountryTimeZone,
  formatPhoneNumber,
  validateLocale,
  getOppositeLocale,
  createLocalizedSlug
} from './utils';

// Request configuration (default export)
export { default as i18nConfig } from './request';