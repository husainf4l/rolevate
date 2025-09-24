import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getThemeClass(theme: 'light' | 'dark' | 'system'): string {
  switch (theme) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    case 'system':
      return '';
    default:
      return '';
  }
}

export function getContrastColor(backgroundColor: string): 'light' | 'dark' {
  // Simple contrast calculation - for more complex needs, use a proper color library
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'dark' : 'light';
}

export function generateColorScale(baseColor: string, steps: number = 9): string[] {
  // This is a simplified version - for production, use a proper color manipulation library
  const colors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const lightness = 95 - (i * 10); // From 95% to 5%
    colors.push(`hsl(${baseColor}, ${lightness}%)`);
  }

  return colors;
}

export const themeVariables = {
  light: {
    '--background': '#ffffff',
    '--foreground': '#171717',
    '--primary': '#0070f3',
    '--primary-foreground': '#ffffff',
    '--secondary': '#f4f4f4',
    '--secondary-foreground': '#171717',
    '--muted': '#f8f9fa',
    '--muted-foreground': '#6b7280',
    '--accent': '#e1e1e1',
    '--accent-foreground': '#171717',
    '--destructive': '#ef4444',
    '--destructive-foreground': '#ffffff',
    '--border': '#e5e5e5',
    '--input': '#ffffff',
    '--ring': '#0070f3',
    '--card': '#ffffff',
    '--card-foreground': '#171717',
    '--popover': '#ffffff',
    '--popover-foreground': '#171717',
  },
  dark: {
    '--background': '#0a0a0a',
    '--foreground': '#ededed',
    '--primary': '#0ea5e9',
    '--primary-foreground': '#0a0a0a',
    '--secondary': '#1a1a1a',
    '--secondary-foreground': '#ededed',
    '--muted': '#171717',
    '--muted-foreground': '#9ca3af',
    '--accent': '#262626',
    '--accent-foreground': '#ededed',
    '--destructive': '#dc2626',
    '--destructive-foreground': '#ffffff',
    '--border': '#262626',
    '--input': '#171717',
    '--ring': '#0ea5e9',
    '--card': '#0a0a0a',
    '--card-foreground': '#ededed',
    '--popover': '#0a0a0a',
    '--popover-foreground': '#ededed',
  },
} as const;

export function applyThemeVariables(theme: keyof typeof themeVariables): void {
  const variables = themeVariables[theme];
  const root = document.documentElement;

  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function createThemeChangeListener(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const listener = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', listener);

  return () => mediaQuery.removeEventListener('change', listener);
}