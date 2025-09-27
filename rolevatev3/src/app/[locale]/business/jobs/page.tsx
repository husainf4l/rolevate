import BusinessLayout from '@/components/layout/business-layout';
import JobsManagement from '@/components/business/jobs-management';

export default async function JobsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const search = await searchParams;

  return (
    <BusinessLayout locale={locale}>
      <JobsManagement locale={locale} searchParams={search} />
    </BusinessLayout>
  );
}