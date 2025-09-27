"use client";

import { ReactNode } from 'react';

interface BusinessLayoutProps {
  children: ReactNode;
  locale?: string;
}

export default function BusinessLayout({ children, locale }: BusinessLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Add business navigation/sidebar when ready */}
      <div className={`container mx-auto px-4 py-8 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
        {children}
      </div>
    </div>
  );
}