import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule a Meeting - Rolevate Banking Recruitment",
  description:
    "Schedule a demo with our team to see how Rolevate can transform your banking recruitment process with AI-powered technology.",
  keywords: "banking recruitment demo, schedule HR tech demo, bank hiring consultation",
  openGraph: {
    title: "Schedule a Meeting - Rolevate Banking Recruitment",
    description: "Book a personalized demo to see how our AI platform can transform your banking recruitment process.",
    images: [{ url: "/images/rolevate-logo.png", width: 1200, height: 630, alt: "Rolevate Meeting" }],
  },
};

export default function ScheduleMeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
