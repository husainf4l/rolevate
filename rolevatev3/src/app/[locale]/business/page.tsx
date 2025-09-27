import BusinessLayout from '@/components/layout/business-layout';

export default async function BusinessPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <BusinessLayout locale={locale}>
      <div></div>
    </BusinessLayout>
  );
}
