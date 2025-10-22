import type { NextConfig } from "next";
import  createNextIntlPlugin  from "next-intl/plugin";


const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['clsx'],
  },
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
