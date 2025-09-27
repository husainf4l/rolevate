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
  openGraph: {
    title: 'Rolevate - AI-Powered Recruitment',
    description: 'Transform your job search with AI-powered interviews and intelligent career matching.',
    type: 'website',
  },
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}