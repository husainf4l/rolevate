'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';

interface HeroSearchFormProps {
  messagePlaceholder: string;
  countries: string[];
  locale: string;
}

export default function HeroSearchForm({ messagePlaceholder, countries, locale }: HeroSearchFormProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [message, setMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      setSelectedCountry(countries[0]);
    }
  }, [countries, selectedCountry]);

  const handleSendClick = () => {
    // Add powerful Apple-style exit animation
    const heroSection = document.querySelector('section');
    const body = document.body;

    if (heroSection) {
      // Add blur and scale effect to entire page
      body.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      body.style.transform = 'scale(0.98)';
      body.style.filter = 'blur(1px)';

      // Hero section exit animation
      heroSection.style.transform = 'scale(0.92) translateY(-20px)';
      heroSection.style.opacity = '0';
      heroSection.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      heroSection.style.filter = 'blur(2px)';
    }

    // Navigate after animation completes
    setTimeout(() => {
      // Reset body styles before navigation
      body.style.transform = '';
      body.style.filter = '';
      body.style.transition = '';

      router.push(`/${locale}/chat`);
    }, 400);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl max-w-lg w-full">
      <div className="space-y-3 sm:space-y-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={messagePlaceholder}
          className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground placeholder-muted-foreground transition-all duration-300 hover:bg-muted/80 shadow-sm"
        />
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
          <div className="relative" ref={dropdownRef}>
            <Button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              variant="secondary"
              size="default"
              className="w-full sm:w-32 justify-between text-sm sm:text-base"
            >
              <span className="font-medium truncate">{selectedCountry}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-full sm:w-32 bg-popover/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-xl z-10 overflow-hidden max-h-40 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                <div className="py-1">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => {
                        setSelectedCountry(country);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">{country}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleSendClick}
            variant="default"
            size="default"
            className="w-full sm:w-auto hover:scale-105 active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <svg className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 relative z-10 ${locale === 'ar' ? 'scale-x-[-1]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            <div className="absolute inset-0 rounded-sm bg-white/10 scale-0 group-hover:scale-100 transition-transform duration-500 origin-center"></div>
          </Button>
        </div>
      </div>
    </div>
  );
}