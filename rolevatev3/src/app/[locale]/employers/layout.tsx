import { Navbar } from '@/components/layout';
import EmployersNavbar from '@/components/employers/employers-navbar';
import Footer from '@/components/common/footer';
import { getTranslations } from 'next-intl/server';

export default async function EmployersLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <EmployersNavbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer locale={locale} />
    </>
  );
}