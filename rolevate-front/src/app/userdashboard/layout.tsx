import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import UserSidebar from "@/components/dashboard/UserSidebar";

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
        <div className="flex h-screen overflow-hidden">
          <UserSidebar />
          <main className="flex-1 overflow-y-auto lg:ml-64">{children}</main>
        </div>
      </body>
    </html>
  );
}
