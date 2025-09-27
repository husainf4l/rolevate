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
    '--background': 'oklch(1 0 0)',
    '--foreground': 'oklch(0.147 0.004 49.25)',
    '--primary': 'oklch(0.3 0 0)',
    '--primary-foreground': 'oklch(0.985 0.001 106.423)',
    '--secondary': 'oklch(0.97 0.001 106.424)',
    '--secondary-foreground': 'oklch(0.216 0.006 56.043)',
    '--muted': 'oklch(0.97 0.001 106.424)',
    '--muted-foreground': 'oklch(0.553 0.013 58.071)',
    '--accent': 'oklch(0.97 0.001 106.424)',
    '--accent-foreground': 'oklch(0.216 0.006 56.043)',
    '--destructive': 'oklch(0.577 0.245 27.325)',
    '--destructive-foreground': 'oklch(0.985 0.001 106.423)',
    '--border': 'oklch(0.923 0.003 48.717)',
    '--input': 'oklch(0.923 0.003 48.717)',
    '--ring': 'oklch(0.5 0 0)',
    '--card': 'oklch(1 0 0)',
    '--card-foreground': 'oklch(0.147 0.004 49.25)',
    '--popover': 'oklch(1 0 0)',
    '--popover-foreground': 'oklch(0.147 0.004 49.25)',
  },
  dark: {
    '--background': 'oklch(0.147 0.004 49.25)',
    '--foreground': 'oklch(0.985 0.001 106.423)',
    '--primary': 'oklch(0.75 0 0)',
    '--primary-foreground': 'oklch(0.216 0.006 56.043)',
    '--secondary': 'oklch(0.268 0.007 34.298)',
    '--secondary-foreground': 'oklch(0.985 0.001 106.423)',
    '--muted': 'oklch(0.268 0.007 34.298)',
    '--muted-foreground': 'oklch(0.709 0.01 56.259)',
    '--accent': 'oklch(0.268 0.007 34.298)',
    '--accent-foreground': 'oklch(0.985 0.001 106.423)',
    '--destructive': 'oklch(0.704 0.191 22.216)',
    '--destructive-foreground': 'oklch(0.985 0.001 106.423)',
    '--border': 'oklch(1 0 0 / 10%)',
    '--input': 'oklch(1 0 0 / 15%)',
    '--ring': 'oklch(0.6 0 0)',
    '--card': 'oklch(0.216 0.006 56.043)',
    '--card-foreground': 'oklch(0.985 0.001 106.423)',
    '--popover': 'oklch(0.216 0.006 56.043)',
    '--popover-foreground': 'oklch(0.985 0.001 106.423)',
  },
} as const;

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