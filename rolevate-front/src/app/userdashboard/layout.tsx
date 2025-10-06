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
        <main className="flex-1 lg:ml-64 overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
