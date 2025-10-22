"use client";

import "../globals.css";
import UserSidebar from "@/components/dashboard/UserSidebar";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function UserDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute allowedUserTypes={['CANDIDATE']}>
      <div className="flex h-screen">
        <UserSidebar />
        <main className="flex-1 lg:ml-24 overflow-auto">
          <div className="flex justify-center min-h-full">
            <div className="w-full max-w-7xl px-6 py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

