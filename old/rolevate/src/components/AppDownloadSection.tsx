'use client';

import { useTranslations } from 'next-intl';

interface AppDownloadSectionProps {
  locale: string;
}

export default function AppDownloadSection({ locale }: AppDownloadSectionProps) {
  const t = useTranslations('appDownload');

  return (
    <section className="py-12 lg:py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {/* Apple App Store Button */}
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg min-w-[180px]"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-80">Download on the</div>
              <div className="text-lg font-semibold">App Store</div>
            </div>
          </a>

          {/* Google Play Store Button */}
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg min-w-[180px]"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5Z"/>
              <path d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z"/>
              <path d="M20.16 10.81C20.5 11.08 20.75 11.53 20.75 12C20.75 12.47 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81Z"/>
              <path d="M6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z"/>
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-80">Get it on</div>
              <div className="text-lg font-semibold">Google Play</div>
            </div>
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="text-center bg-card p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-card-foreground mb-3">{t('instantNotifications')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('instantNotificationsDesc')}</p>
          </div>

          <div className="text-center bg-card p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-card-foreground mb-3">{t('saveAndApply')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('saveAndApplyDesc')}</p>
          </div>

          <div className="text-center bg-card p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-card-foreground mb-3">{t('trackProgress')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('trackProgressDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}