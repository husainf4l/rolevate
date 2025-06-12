// This is a custom Open Graph component for SEO optimization
import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({
  title = "Rolevate AI | AI Interview Platform for Banking & Financial Services",
  description = "Rolevate AI helps optimize hiring for banks and financial institutions with automated interviews, AI-powered candidate assessment, and compliance-ready recruitment workflows.",
  image = "/images/rolevate-logo.png",
  url = "https://rolevate.com",
  type = "website",
}: SEOProps) {
  const fullUrl = `https://rolevate.com${
    url === "https://rolevate.com" ? "" : url
  }`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="AI interview platform, banking recruitment, financial services hiring, automated interviews, recruitment technology, compliance hiring, candidate assessment, HR technology, banking talent acquisition"
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`https://rolevate.com${image}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`https://rolevate.com${image}`} />

      {/* Canonical Link */}
      <link rel="canonical" href={fullUrl} />
    </Head>
  );
}
