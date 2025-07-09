import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import UserSidebar from "@/components/dashboard/UserSidebar";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Candidate Dashboard - Rolevate",
  description: "Manage your job applications, CV, and career progress",
};

export default function UserDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-[#23272a] bg-gray-50`}
      >
        <ProtectedRoute allowedUserTypes={['CANDIDATE']}>
          <div className="flex h-screen">
            <UserSidebar />
            <main className="flex-1 lg:ml-64 overflow-auto">{children}</main>
          </div>
        </ProtectedRoute>
      </body>
    </html>
  );
}
