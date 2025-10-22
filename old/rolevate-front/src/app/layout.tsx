import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PerformanceMonitor from "@/components/common/PerformanceMonitor";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/components/common/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Rolevate - AI-Powered Recruitment Platform",
    template: "%s | Rolevate"
  },
  description: "Revolutionary recruitment platform powered by AI. Transform your job search with intelligent matching, automated interviews, and career acceleration tools.",
  keywords: ["recruitment", "AI", "job search", "interviews", "career", "hiring", "Middle East"],
  authors: [{ name: "Rolevate Team" }],
  creator: "Rolevate",
  publisher: "Rolevate",
  metadataBase: new URL('https://rolevate.com'),
  alternates: {
    canonical: "https://rolevate.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rolevate.com",
    title: "Rolevate - AI-Powered Recruitment Platform",
    description: "Transform your job search with AI-powered interviews and intelligent career matching.",
    siteName: "Rolevate",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 630,
        alt: "Rolevate - AI-Powered Recruitment Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rolevate - AI-Powered Recruitment Platform",
    description: "Transform your job search with AI-powered interviews and intelligent career matching.",
    images: ["/images/hero.png"],
    creator: "@rolevate",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://4wk-garage-media.s3.me-central-1.amazonaws.com" />
        <link
          rel="preload"
          as="image"
          href="/images/hero.png"
          fetchPriority="high"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-[#23272a] bg-white`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 z-50 bg-[#0fc4b5] text-white px-4 py-2 rounded-md font-medium"
        >
          Skip to main content
        </a>
        <PerformanceMonitor />
        <Toaster />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

