import BusinessSignupForm from '@/components/auth/business-signup-form';
import Image from 'next/image';

export default async function BusinessSignupPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <Image
          src="/images/login/login2.jpeg"
          alt="Business signup background"
          fill
          className="object-cover"
          priority
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="max-w-lg">
            {/* Main Title */}
            <h1 className="text-3xl lg:text-4xl font-light mb-6 leading-tight text-white">
              {locale === 'ar' ? 'ابدأ رحلتك المهنية' : 'Start Your Business Journey'}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg text-white/90 leading-relaxed font-light">
              {locale === 'ar' 
                ? 'انضم إلى آلاف الشركات التي تثق في منصتنا لإدارة المواهب وتطوير الأعمال'
                : 'Join thousands of companies that trust our platform for talent management and business growth'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 bg-background">
        <BusinessSignupForm locale={locale} />
      </div>
    </div>
  );
}