'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useState, useRef, useEffect } from 'react';

const localeConfig = {
  en: { name: 'English', code: 'EN' },
  ar: { name: 'العربية', code: 'AR' }
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === 'ar';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
    setIsOpen(false);
  };

  const currentLocale = localeConfig[locale as keyof typeof localeConfig];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-2.5 py-1.5 bg-foreground/10 hover:bg-foreground/20 rounded-lg text-xs font-medium text-foreground transition-all duration-200 hover:scale-105"
      >
        <span>{currentLocale.code}</span>
        <svg
          className={`${isRTL ? 'mr-1' : 'ml-1'} w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 w-32 bg-card/95 backdrop-blur-xl rounded-lg shadow-lg overflow-hidden transition-all duration-200 ease-out ${isRTL ? 'origin-top-left' : 'origin-top-right'} ${
        isOpen
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
      }`}>
        <div className="py-1">
          {Object.entries(localeConfig).map(([code, config]) => (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              className={`w-full flex items-center px-3 py-2 text-xs transition-all duration-150 hover:bg-foreground/10 ${
                locale === code
                  ? 'bg-foreground/10 text-foreground font-semibold'
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              <span className="font-medium">{config.name}</span>
              {locale === code && (
                <svg className={`${isRTL ? 'mr-auto' : 'ml-auto'} w-3 h-3`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}