import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import AuthProvider from "@/components/common/AuthProvider";
import GraphQLProvider from "@/components/common/GraphQLProvider";
import MaintenancePage from "@/components/common/MaintenancePage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rolevate - Elevate Your Career | AI-Powered Job Matching Platform",
  description: "Transform your career with Rolevate's AI-powered job matching platform. Connect with top employers, showcase your skills, and find your perfect role.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
};

// Check environment variable for maintenance mode
const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <GraphQLProvider>
            {isMaintenanceMode ? <MaintenancePage /> : children}
          </GraphQLProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
