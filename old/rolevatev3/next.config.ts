import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // typedRoutes: true, // Temporarily disabled due to i18n conflicts
};

export default withNextIntl(nextConfig);
