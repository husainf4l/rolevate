'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import type { Theme } from '@/lib/theme';

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';
  const isLight = resolvedTheme === 'light';
  const isSystem = theme === 'system';

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  const setSystemTheme = () => setTheme('system');

  return {
    theme: theme as Theme,
    setTheme: setTheme as (theme: Theme) => void,
    resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,
    systemTheme: systemTheme as 'light' | 'dark' | undefined,
    mounted,
    isDark,
    isLight,
    isSystem,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function usePrefersDark(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersLight(): boolean {
  return useMediaQuery('(prefers-color-scheme: light)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}