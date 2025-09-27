"use client";

import { ReactNode } from 'react';

interface BusinessLayoutProps {
  children: ReactNode;
  locale?: string;
}

export default function BusinessLayout({ children /*locale*/ }: BusinessLayoutProps) {
  // const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: Add business navigation/sidebar when ready */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}