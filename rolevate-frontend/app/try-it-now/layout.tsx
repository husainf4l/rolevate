import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try Rolevate Now - Experience AI-Powered Bank Recruiting",
  description:
    "Try our AI-powered banking recruitment platform. Experience an automated interview that showcases our technology for financial sector hiring.",
  keywords: "banking AI demo, free recruitment trial, bank HR technology, interview AI demo",
  openGraph: {
    title: "Try Rolevate Now - Experience AI-Powered Bank Recruiting",
    description: "Experience our automated interview technology for the banking industry firsthand with a free trial.",
    images: [{ url: "/images/rolevate-logo.png", width: 1200, height: 630, alt: "Rolevate Demo" }],
  },
};

export default function TryItNowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
