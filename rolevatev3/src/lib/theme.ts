export const themes = ['light', 'dark', 'system'] as const;
export type Theme = (typeof themes)[number];

export const themeConfig = {
  themes,
  defaultTheme: 'system' as Theme,
  enableSystem: true,
  disableTransitionOnChange: false,
  attribute: 'class' as const,
  storageKey: 'theme',
  forcedTheme: undefined,
};

export const themeColors = {
  light: {
    background: '#ffffff',
    foreground: '#171717',
    primary: '#0070f3',
    secondary: '#f4f4f4',
    muted: '#f8f9fa',
    accent: '#e1e1e1',
    destructive: '#ef4444',
    border: '#e5e5e5',
    input: '#ffffff',
    ring: '#0070f3',
    card: '#ffffff',
    popover: '#ffffff',
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#ededed',
    primary: '#0ea5e9',
    secondary: '#1a1a1a',
    muted: '#171717',
    accent: '#262626',
    destructive: '#dc2626',
    border: '#262626',
    input: '#171717',
    ring: '#0ea5e9',
    card: '#0a0a0a',
    popover: '#0a0a0a',
  },
} as const;

export type ThemeColors = typeof themeColors;
export type ColorScheme = keyof ThemeColors;

export function getThemeColors(theme: ColorScheme): ThemeColors[ColorScheme] {
  return themeColors[theme];
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

export const animations = {
  transition: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;