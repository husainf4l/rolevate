import Image from "next/image";
import Hero from "../components/Hero";
import WhatIsRolevate from "../components/WhatIsRolevate";
import HowItWorks from "../components/HowItWorks";
import ProblemVsSolution from "@/components/ProblemVsSolution";
import BankIndustryFocus from "@/components/BankIndustryFocus";
import CallToAction from "@/components/CallToAction";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rolevate AI | Automated Interview Platform for Banking & Finance",
  description:
    "Rolevate AI streamlines hiring for banks and financial institutions with automated interviews, AI scoring, and compliance-ready workflows.",
  openGraph: {
    title: "Rolevate AI | Automated Interview Platform for Banking & Finance",
    description:
      "Rolevate AI streamlines hiring for banks and financial institutions with automated interviews, AI scoring, and compliance-ready workflows.",
    url: "https://rolevate.com/",
    siteName: "Rolevate AI",
    images: [
      {
        url: "/images/rolevate-logo.png",
        width: 512,
        height: 128,
        alt: "Rolevate AI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rolevate AI | Automated Interview Platform for Banking & Finance",
    description:
      "Rolevate AI streamlines hiring for banks and financial institutions with automated interviews, AI scoring, and compliance-ready workflows.",
    images: ["/images/rolevate-logo.png"],
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
              "Rolevate AI streamlines hiring for banks and financial institutions with automated interviews, AI scoring, and compliance-ready workflows.",
            publisher: {
              "@type": "Organization",
              name: "Rolevate AI",
              logo: {
                "@type": "ImageObject",
                url: "https://rolevate.com/images/rolevate-logo.png",
              },
            },
            potentialAction: {
              "@type": "SearchAction",
              target: "https://rolevate.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      <div className="min-h-screen">
        <Hero />
        <WhatIsRolevate />
        <HowItWorks />
        <ProblemVsSolution />
        <BankIndustryFocus />
        <CallToAction />
      </div>
    </>
  );
}
