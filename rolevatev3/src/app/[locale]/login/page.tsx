import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LoginForm from '@/components/auth/login-form';
import Image from 'next/image';
import { getDirection, type Locale } from '@/i18n/config';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Login - Rolevate',
  description: 'Sign in to your Rolevate account',
};

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('login');
  const direction = getDirection(locale as Locale);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Enhanced Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/images/login/login1.jpeg"
          alt="Login background"
          fill
          className="object-cover"
          priority
        />
        
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        
        {/* Hero Content - Ultra Simple */}
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="max-w-lg">
            {/* Main Title - Clean Typography */}
            <h1 className="text-3xl lg:text-4xl font-light mb-6 leading-tight text-white">
              {t('heroTitle')}
            </h1>
            
            {/* Subtitle - Simple */}
            <p className="text-lg text-white/90 leading-relaxed font-light">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 ">
        <div className="w-full max-w-md">
        
          <LoginForm />
        </div>
      </div>
    </div>
  );
}