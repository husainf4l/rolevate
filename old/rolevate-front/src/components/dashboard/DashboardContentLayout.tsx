'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show sidebar for setup-company page
  if (pathname?.includes('/setup-company')) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-24 overflow-auto">
        <div className="flex justify-center min-h-full">
          <div className="w-full max-w-7xl px-6 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

