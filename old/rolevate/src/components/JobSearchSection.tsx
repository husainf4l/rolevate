'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';

interface JobSearchSectionProps {
  locale: string;
}

export default function JobSearchSection({ locale }: JobSearchSectionProps) {
  const t = useTranslations('jobSearch');
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');

  const cityKeys = [
    'remote',
    // Countries
    'jordan',
    'saudiArabia',
    'uae',
    'qatar',
    // Jordan
    'amman',
    'irbid',
    'zarqa',
    'aqaba',
    'madaba',
    'karak',
    'mafraq',
    'tafilah',
    'maan',
    'ajloun',
    // Saudi Arabia (KSA)
    'riyadh',
    'jeddah',
    'mecca',
    'medina',
    'dammam',
    'khobar',
    'dhahran',
    'taif',
    'tabuk',
    'abha',
    'najran',
    'hail',
    'alKhobar',
    'yanbu',
    // UAE
    'dubai',
    'abuDhabi',
    'sharjah',
    'ajman',
    'rasAlKhaimah',
    'fujairah',
    'ummAlQuwain',
    'alAin',
    'jumeirah',
    'deira',
    'burjKhalifa',
    // Qatar
    'doha',
    'alWakrah',
    'alKhor',
    'ummSalal',
    'alRayyan',
    'alDaayen',
    'alShamal',
    'alShahaniya'
  ];

  const cities = cityKeys.map(key => t(`cities.${key}`));

  const countryKeys = ['jordan', 'saudiArabia', 'uae', 'qatar'];
  const countries = countryKeys.map(key => t(`cities.${key}`));

  const filteredCities = locationSearch.trim() === ''
    ? countries
    : cities.filter(city =>
        city.toLowerCase().includes(locationSearch.toLowerCase())
      );

  const handleLocationSelect = (city: string) => {
    setLocation(city);
    setLocationSearch(city);
    setIsLocationDropdownOpen(false);
  };

  const handleSearch = () => {
    // Navigate to jobs page with search parameters
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (location.trim()) {
      params.set('location', location.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `/jobs?${queryString}` : '/jobs';

    router.push(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 leading-tight">
          {t('title')}
        </h2>
        <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
          {t('subtitle')}
        </p>
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-8 py-4 rounded-full">
          <div className="text-4xl font-bold text-primary">{t('activeJobsCount')}</div>
          <div className="text-lg font-medium text-foreground">{t('activeJobsLabel')}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="relative">
          {/* Luxury background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>

          <div className="relative bg-card/95 backdrop-blur-md rounded-3xl p-8 lg:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Job Title/Keywords */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-card-foreground">
                  {t('jobTitleLabel')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('jobTitlePlaceholder')}
                    className="w-full px-6 py-4 rounded-2xl bg-background/95 backdrop-blur-md text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3 relative">
                <label className="block text-base font-semibold text-card-foreground">
                  {t('locationLabel')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setIsLocationDropdownOpen(true);
                    }}
                    onFocus={() => setIsLocationDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsLocationDropdownOpen(false), 200)}
                    placeholder={t('locationPlaceholder')}
                    className="w-full px-6 py-4 rounded-2xl bg-background/95 backdrop-blur-md text-card-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>

                  {isLocationDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-card/98 backdrop-blur-lg rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <div
                            key={city}
                            onClick={() => handleLocationSelect(city)}
                            className="px-6 py-4 hover:bg-primary/10 cursor-pointer text-card-foreground transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl"
                          >
                            {city}
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-4 text-muted-foreground">
                          {t('noCitiesFound')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-10 text-center">
              <button
                onClick={handleSearch}
                className="group relative px-12 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-2xl hover:from-primary/90 hover:to-primary font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">{t('searchButton')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Quick Filters */}
            <div className="mt-12 pt-8">
              <h3 className="text-base font-semibold text-card-foreground mb-6 text-center">
                {t('popularSearches')}
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {['remote', 'fullTime', 'entryLevel', 'senior', 'tech', 'marketing'].map((filterKey) => (
                  <button
                    key={filterKey}
                    className="px-6 py-2 bg-gradient-to-r from-muted/50 to-muted/30 hover:from-primary/20 hover:to-primary/10 text-muted-foreground hover:text-primary rounded-full text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    {t(`filters.${filterKey}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}