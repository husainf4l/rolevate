import Hero from '@/components/homepage/Hero';
import AvailableJobs from '@/components/homepage/AvailableJobs';
import CVUploadSection from '@/components/homepage/CVUploadSection';
import SuccessStories from '@/components/homepage/SuccessStories';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <AvailableJobs />
      <CVUploadSection />
      <SuccessStories />
    </div>
  );
}
