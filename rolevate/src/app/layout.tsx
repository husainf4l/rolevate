import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Rolevate',
    template: '%s | Rolevate'
  },
  description: 'AI-powered recruitment platform for the Middle East. Land your dream job faster with intelligent career matching.',
  keywords: ['jobs', 'recruitment', 'AI', 'Middle East', 'careers'],
  authors: [{ name: 'Rolevate' }],
  creator: 'Rolevate Team',
  publisher: 'Rolevate',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://rolevate.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'ar-SA': '/ar',
    },
  },
  openGraph: {
    title: 'Rolevate - AI-Powered Recruitment',
    description: 'Transform your job search with AI-powered interviews and intelligent career matching.',
    type: 'website',
    siteName: 'Rolevate',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    url: 'https://rolevate.com',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rolevate - AI-Powered Job Search',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rolevate - AI-Powered Recruitment',
    description: 'Transform your job search with AI-powered interviews and intelligent career matching.',
    creator: '@rolevate',
    images: ['/images/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'Job Search Platform',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1a73e8' },
    { media: '(prefers-color-scheme: dark)', color: '#8ab4f8' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#1a73e8',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rolevate',
  },
  applicationName: 'Rolevate',
  generator: 'Next.js',
  abstract: 'AI-powered job search platform for the Middle East',
  appLinks: {
    web: {
      url: 'https://rolevate.com',
      should_fallback: true,
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#1a73e8',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}