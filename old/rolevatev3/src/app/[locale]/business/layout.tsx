import BusinessSidebar from '@/components/layout/business-sidebar';
import { ReactNode } from 'react';

interface BusinessLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function BusinessLayout({ 
  children, 
  params 
}: BusinessLayoutProps) {
  const { locale } = await params;

  return (
    <div className="flex h-screen bg-background">
      <BusinessSidebar locale={locale} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}