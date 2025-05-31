import React from 'react';
import Sidebar from './component/sidebar';

// For the dashboard, we'll likely want a different navigation component
// This is just a placeholder - you might want to create a DashboardNavbar component
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Dashboard-specific navigation would go here */}
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">


            <Sidebar/>
        
        <div className="flex flex-col flex-1 overflow-hidden">
       
          
          <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}