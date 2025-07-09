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
  if (pathname.includes('/setup-company')) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 overflow-auto">{children}</main>
    </div>
  );
}
