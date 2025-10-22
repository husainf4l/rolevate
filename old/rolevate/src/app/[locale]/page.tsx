import Hero from '@/components/hero';
import { Navbar } from '@/components/common';
import JobSearchSection from '@/components/JobSearchSection';
import FindJobsByCountry from '@/components/FindJobsByCountry';
import CVUploadSection from '@/components/CVUploadSection';
import AppDownloadSection from '@/components/AppDownloadSection';
import Footer from '@/components/Footer';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-background antialiased">
      <Navbar />
      <main className="pt-16">
        <Hero locale={locale} />
        <JobSearchSection locale={locale} />
        <CVUploadSection locale={locale} />

        <FindJobsByCountry locale={locale} />
        <AppDownloadSection locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}