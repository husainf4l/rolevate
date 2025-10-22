"use client";

import "../globals.css";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import DashboardContentLayout from "@/components/dashboard/DashboardContentLayout";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute allowedUserTypes={["COMPANY"]}>
      <DashboardContentLayout>{children}</DashboardContentLayout>
    </ProtectedRoute>
  );
}

