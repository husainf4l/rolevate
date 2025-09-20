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
    <section >
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className={`flex flex-col lg:flex-row min-h-[550px] rounded-2xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden bg-gray-50 dark:bg-gray-950 ${
          locale === 'ar' ? 'lg:flex-row-reverse' : ''
        }`}>
          {/* Image Half */}
          <div className="w-full lg:w-1/2 relative">
            <img
              src={`/images/hero/${locale === 'ar' ? 'hero1' : 'hero1'}.jpeg`}
              alt="Hero Image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/5 lg:to-black/20" />
          </div>

          {/* Text and Chat Container Half */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 xl:p-16 bg-gray-100 dark:bg-gray-900">
            {/* Content */}
            <div className="w-full max-w-lg space-y-6">
              <div className="space-y-6">
                <div className={`mb-8 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                  <div className="max-w-lg">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('title')}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
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