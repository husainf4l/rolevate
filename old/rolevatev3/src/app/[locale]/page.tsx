import Hero from '@/components/hero';
import LatestJobs from '@/components/home/latest-jobs';
import BlogSection from '@/components/home/blog-section';
import { Navbar } from '@/components/layout';
import Footer from '@/components/common/footer';

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
      <Footer locale={locale} />
    </>
  );
}