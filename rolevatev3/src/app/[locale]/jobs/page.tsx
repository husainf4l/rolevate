import React from "react";
import { Navbar } from "@/components/layout";
import Footer from "@/components/common/footer";
import { getTranslations } from 'next-intl/server';
import JobsListing from "@/components/jobs/jobs-listing";

interface JobsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: JobsPageProps) {
  const { locale } = await params;
  const t = await getTranslations('jobs');
  
  return {
    title: t('title'),
    description: locale === 'ar' 
      ? 'اكتشف الفرص الوظيفية المناسبة لمهاراتك وخبراتك'
      : 'Discover career opportunities that match your skills and experience'
  };
}

export default async function JobsPage({ params }: JobsPageProps) {
  const { locale } = await params;
  
  return (
    <>
      <Navbar />
      <JobsListing locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
