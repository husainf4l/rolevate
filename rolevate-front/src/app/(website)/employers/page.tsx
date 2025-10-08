import type { Metadata } from "next";
import React from "react";
import CorporateHero from "@/components/corporate/CorporateHero";
import CorporateFeatures from "@/components/corporate/CorporateFeatures";
import CorporateCTA from "@/components/corporate/CorporateCTA";

export const metadata: Metadata = {
  title: "For Employers - Rolevate | AI-Powered Recruitment Platform",
  description: "Transform your hiring process with Rolevate's AI-powered recruitment platform. Find top talent faster, reduce hiring costs, and build better teams with our advanced matching technology.",
  alternates: {
    canonical: "https://rolevate.com/employers",
  },
};

export default function EmployersPage() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
        <CorporateHero />

      {/* Features Section */}
      <CorporateFeatures />

      {/* Call to Action */}
      <CorporateCTA />
    </main>
  );
}

