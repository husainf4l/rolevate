"use client";

import { usePathname } from "next/navigation";
import Head from "next/head";

interface StructuredDataProps {
  type?: "website" | "organization" | "job-posting";
  data?: Record<string, any>;
}

export function StructuredData({ type = "website", data }: StructuredDataProps) {
  const pathname = usePathname();

  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === "website" ? "WebSite" : type === "organization" ? "Organization" : "JobPosting",
      name: "Rolevate",
      url: `https://rolevate.com${pathname}`,
      description: "AI-powered recruitment platform for modern job seekers and employers",
      ...data,
    };

    if (type === "website") {
      return {
        ...baseData,
        potentialAction: {
          "@type": "SearchAction",
          target: "https://rolevate.com/jobs?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      };
    }

    if (type === "organization") {
      return {
        ...baseData,
        logo: "https://rolevate.com/images/logo.png",
        sameAs: [
          "https://twitter.com/rolevate",
          "https://linkedin.com/company/rolevate",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+971-XXX-XXXX",
          contactType: "customer service",
          areaServed: "AE",
          availableLanguage: "en",
        },
      };
    }

    return baseData;
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getStructuredData()),
        }}
      />
    </Head>
  );
}

// Hook for dynamic structured data
export function useStructuredData(type: StructuredDataProps["type"] = "website", data: Record<string, any> = {}) {
  return <StructuredData type={type} data={data} />;
}