import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale, localeConfig } from './config';

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: localeConfig.localePrefix,
  alternateLinks: localeConfig.alternateLinks,
  localeDetection: localeConfig.localeDetection
});
