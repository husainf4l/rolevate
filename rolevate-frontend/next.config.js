/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  poweredByHeader: false,  // Remove X-Powered-By header for security
  compress: true,          // Enable gzip compression
  // Note: i18n config has been removed as it's not supported in App Router
  // Use middleware.js for internationalization in App Router instead
  images: {
    domains: ['rolevate.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
