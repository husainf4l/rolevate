"use client";

import React from "react";
import CorporateHero from "@/components/corporate/CorporateHero";
import CorporateFeatures from "@/components/corporate/CorporateFeatures";
import CorporateCTA from "@/components/corporate/CorporateCTA";

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
