'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Sun, Moon, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, usePathname } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { useParams } from 'next/navigation';

export default function SettingsMenu() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as Locale;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  const themeOptions = [
    { value: 'light', label: t('theme.light'), icon: Sun },
    { value: 'dark', label: t('theme.dark'), icon: Moon },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Open settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="flex items-center gap-2 justify-center">
          <Settings className="h-4 w-4" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Theme Section */}
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </div>
            {theme === value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {/* Language Section */}
        {locales.map((locale) => (
          <DropdownMenuItem key={locale} asChild>
            <Link
              href={pathname}
              locale={locale}
              className="flex items-center justify-between cursor-pointer w-full"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-xs uppercase font-mono">{locale}</span>
              </div>
              {currentLocale === locale && <Check className="h-4 w-4" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}