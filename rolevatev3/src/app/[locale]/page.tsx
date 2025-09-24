import Hero from '@/components/hero';
import LatestJobs from '@/components/home/latest-jobs';
import CVUpload from '@/components/home/cv-upload';
import BlogSection from '@/components/home/blog-section';
import { Navbar } from '@/components/layout';
import Footer from '@/components/common/footer';
import { getTranslations } from 'next-intl/server';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Navbar />
      <Hero locale={locale} />
      <LatestJobs locale={locale} />
      <BlogSection locale={locale} />
      <CVUpload locale={locale} />
      <Footer locale={locale} />
    </>
  );
}