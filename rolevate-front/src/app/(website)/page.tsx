import type { Metadata } from "next";
import Hero from "@/components/homepage/hero";
import AvailableJobs from "@/components/homepage/AvailableJobs";
import CVUploadSection from "@/components/homepage/CVUploadSection";
import SuccessStories from "@/components/homepage/SuccessStories";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://rolevate.com",
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      <AvailableJobs />
      <CVUploadSection />
      <SuccessStories />
    </main>
  );
}
