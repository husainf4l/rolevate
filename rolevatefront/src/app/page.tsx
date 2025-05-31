import Image from "next/image";
import Hero from "../components/Hero";
import WhatIsRolevate from "../components/WhatIsRolevate";
import HowItWorks from "../components/HowItWorks";
import ProblemVsSolution from "@/components/ProblemVsSolution";
import BankIndustryFocus from "@/components/BankIndustryFocus";
import CallToAction from "@/components/CallToAction";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Rolevate | AI Interview Platform for Banking & Financial Services",
  description:
    "Rolevate AI helps optimize hiring for banks and financial institutions with automated interviews, AI-powered candidate assessment, and compliance-ready recruitment workflows.",
  keywords:
    "AI interview platform, banking recruitment, financial services hiring, automated interviews, recruitment technology, compliance hiring, candidate assessment, HR technology, AI hiring tools, banking talent acquisition",
  openGraph: {
    title:
      "Rolevate AI | AI Interview Platform for Banking & Financial Services",
    description:
      "Rolevate AI helps optimize hiring for banks and financial institutions with automated interviews, AI-powered candidate assessment, and compliance-ready recruitment workflows.",
    url: "https://rolevate.com/",
    siteName: "Rolevate AI",
    images: [
      {
        url: "/images/rolevate-logo.png",
        width: 512,
        height: 128,
        alt: "Rolevate AI - Banking Recruitment Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Rolevate AI | AI Interview Platform for Banking & Financial Services",
    description:
      "Rolevate AI helps optimize hiring for banks and financial institutions with automated interviews, AI-powered candidate assessment, and compliance-ready recruitment workflows.",
    images: ["/images/rolevate-logo.png"],
  },
  alternates: {
    canonical: "https://rolevate.com",
  },
};

export default function Home() {
  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Rolevate AI",
            url: "https://rolevate.com/",
            description:
              "Rolevate AI helps optimize hiring for banks and financial institutions with automated interviews, AI-powered candidate assessment, and compliance-ready recruitment workflows.",
            publisher: {
              "@type": "Organization",
              name: "Rolevate AI",
              logo: {
                "@type": "ImageObject",
                url: "https://rolevate.com/images/rolevate-logo.png",
              },
              sameAs: [
                "https://www.linkedin.com/company/rolevate",
                "https://twitter.com/rolevateai",
              ],
            },
            potentialAction: {
              "@type": "SearchAction",
              target: "https://rolevate.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            keywords:
              "AI interview platform, banking recruitment, financial services hiring, automated interviews, recruitment technology, compliance hiring, candidate assessment, HR technology, banking talent acquisition",
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              description:
                "Request a demo of Rolevate AI's banking interview platform today",
            },
          }),
        }}
      />

      {/* Additional Organization Schema for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://rolevate.com",
            name: "Rolevate AI",
            url: "https://rolevate.com/",
            logo: "https://rolevate.com/images/rolevate-logo.png",
            description:
              "An AI-powered interview platform for banks and financial institutions. Streamline your hiring process with automated interviews and compliance-ready workflows.",
            /* Removed address information until confirmed */
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "support@rolevate.com",
              url: "https://rolevate.com/contact",
            },
          }),
        }}
      />
      <div className="min-h-screen">
        <Navbar/>
        <Hero />
        <WhatIsRolevate />
        <HowItWorks />
        <ProblemVsSolution />
        <BankIndustryFocus />
        <CallToAction />
        <Footer/>
      </div>
    </>
  );
}
