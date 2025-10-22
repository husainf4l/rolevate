'use client';

import { useTranslations } from 'next-intl';
import {   HeroSearchForm } from './index';

interface HeroProps {
  locale: string;
}

export default function Hero({ locale }: HeroProps) {
  const t = useTranslations('hero');
  const countries = t.raw('countries') as string[];

  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className={`flex flex-col lg:flex-row min-h-[400px] sm:min-h-[500px] lg:min-h-[550px] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden bg-muted ${
          locale === 'ar' ? 'lg:flex-row-reverse' : ''
        }`}>
          {/* Image Half */}
          <div className="w-full lg:w-1/2 relative h-48 sm:h-64 lg:h-auto">
            <img
              src={`/images/hero/${locale === 'ar' ? 'hero1' : 'hero1'}.jpeg`}
              alt="Hero Image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/5 lg:to-black/20" />
          </div>

          {/* Text and Chat Container Half */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-12 xl:p-16 bg-card">
            {/* Content */}
            <div className="w-full max-w-lg space-y-4 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">
                <div className={`mb-6 sm:mb-8 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                  <div className="max-w-lg">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card-foreground mb-2">{t('title')}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">{t('subtitle')}</p>
                  </div>
                </div>
              </div>

              {/* Search Form Container */}
                <HeroSearchForm
                  messagePlaceholder={t('messagePlaceholder')}
                  countries={countries}
                  locale={locale}
                />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}