import type { Metadata } from "next";
import "../globals.css";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import DashboardContentLayout from "@/components/dashboard/DashboardContentLayout";

export const metadata: Metadata = {
  title: "Dashboard - Rolevate",
  description: "Your job search dashboard",
};

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
