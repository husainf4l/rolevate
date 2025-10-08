import type { Metadata } from "next";
import "../globals.css";
import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/Footer";
import GDPRPopup from "@/components/common/GDPRPopup";

export const metadata: Metadata = {
  title: "Rolevate - Elevate Your Career | AI-Powered Job Matching Platform",
  description: "Transform your career with Rolevate's AI-powered job matching platform. Connect with top employers, showcase your skills, and find your perfect role. Join thousands of professionals who've elevated their careers with us.",
  keywords: "jobs, careers, recruitment, AI job matching, professional development, hiring, employment, job search, career growth, talent acquisition",
  authors: [{ name: "Rolevate Team" }],
  creator: "Rolevate",
  publisher: "Rolevate",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rolevate.com",
    siteName: "Rolevate",
    title: "Rolevate - Elevate Your Career | AI-Powered Job Matching Platform",
    description: "Transform your career with Rolevate's AI-powered job matching platform. Connect with top employers and find your perfect role.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rolevate - Elevate Your Career",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rolevate",
    creator: "@rolevate",
    title: "Rolevate - Elevate Your Career | AI-Powered Job Matching Platform",
    description: "Transform your career with Rolevate's AI-powered job matching platform. Connect with top employers and find your perfect role.",
    images: ["/images/twitter-card.jpg"],
  },
};

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
      <GDPRPopup />
    </>
  );
}

