import Logo from "@/components/common/logo";
import Image from "next/image";
import Hero from "@/components/homepage/hero";
import AvailableJobs from "@/components/homepage/AvailableJobs";
import CVUploadSection from "@/components/homepage/CVUploadSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <AvailableJobs />
      <CVUploadSection />
    </main>
  );
}
