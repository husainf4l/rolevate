'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface FindJobsByCountryProps {
  locale: string;
}

export default function FindJobsByCountry({ locale }: FindJobsByCountryProps) {
  const t = useTranslations('findJobsByCountry');
  const router = useRouter();

  const countries = [
    {
      id: 'jordan',
      name: t('countries.jordan'),
      jobs: '2.5K+',
      cities: ['Amman', 'Irbid', 'Zarqa']
    },
    {
      id: 'saudiArabia',
      name: t('countries.saudiArabia'),
      jobs: '8.2K+',
      cities: ['Riyadh', 'Jeddah', 'Mecca']
    },
    {
      id: 'uae',
      name: t('countries.uae'),
      jobs: '5.1K+',
      cities: ['Dubai', 'Abu Dhabi', 'Sharjah']
    },
    {
      id: 'qatar',
      name: t('countries.qatar'),
      jobs: '1.8K+',
      cities: ['Doha', 'Al Wakrah', 'Al Khor']
    }
  ];

  const handleCountryClick = (countryId: string) => {
    router.push(`/jobs?country=${countryId}`);
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-3 leading-tight">
            {t('title')}
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {countries.map((country) => (
            <div
              key={country.id}
              onClick={() => handleCountryClick(country.id)}
              className="group relative bg-card/90 backdrop-blur-md rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer overflow-hidden"
            >
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                {/* Full width image at top */}
                <div className="relative h-48 overflow-hidden rounded-t-3xl">
                  <img
                    src="/placeholder.jpg"
                    alt={`${country.name} placeholder`}
                    className="w-full h-full object-cover group-hover:brightness-110 group-hover:contrast-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Content with padding */}
                <div className="p-6">
                  {/* Country Name */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                      {country.name}
                    </h3>
                  </div>

                  {/* Job Count */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 px-4 py-2 rounded-2xl">
                      <div className="text-xl font-bold text-primary">{country.jobs}</div>
                      <div className="text-sm font-medium text-primary/80">{t('jobs')}</div>
                    </div>
                  </div>

                  {/* Popular Cities */}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">{t('popularCities')}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {country.cities.map((city) => (
                        <span
                          key={city}
                          className="px-3 py-1 bg-gradient-to-r from-muted/40 to-muted/20 hover:from-primary/20 hover:to-primary/10 text-muted-foreground hover:text-primary rounded-xl text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            {t('exploreMore')}
          </p>
          <button
            onClick={() => router.push('/jobs')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-2xl hover:from-primary/90 hover:to-primary font-semibold text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <span>{t('viewAllJobs')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}