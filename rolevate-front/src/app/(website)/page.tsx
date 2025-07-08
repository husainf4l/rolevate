import Hero from "@/components/homepage/hero";
import AvailableJobs from "@/components/homepage/AvailableJobs";
import CVUploadSection from "@/components/homepage/CVUploadSection";
import SuccessStories from "@/components/homepage/SuccessStories";

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
