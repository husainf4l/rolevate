import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import DashboardContentLayout from "@/components/dashboard/DashboardContentLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-[#23272a] bg-gray-50`}
      >
        <ProtectedRoute allowedUserTypes={["COMPANY"]}>
          <DashboardContentLayout>{children}</DashboardContentLayout>
        </ProtectedRoute>
      </body>
    </html>
  );
}
