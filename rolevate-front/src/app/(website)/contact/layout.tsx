import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Rolevate | Get in Touch with Our Team",
  description: "Have questions about Rolevate's AI-powered recruitment platform? Contact our team for support, partnerships, or general inquiries. We're here to help elevate your career or hiring process.",
  alternates: {
    canonical: "https://rolevate.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

