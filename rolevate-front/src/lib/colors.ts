// Global color constants for consistent branding
export const BRAND_COLORS = {
  // Primary teal colors
  teal: {
    light: '#13ead9',
    DEFAULT: '#0891b2',
    dark: '#0c7594',
  },
  
  // Professional grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Slate for sophisticated combinations
  slate: {
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Semantic colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    accent: '#0891b2',
  }
} as const;

// Gradient combinations
export const BRAND_GRADIENTS = {
  primary: 'linear-gradient(90deg, #0891b2 0%, #334155 100%)',
  secondary: 'linear-gradient(90deg, #334155 0%, #0891b2 100%)',
  subtle: 'linear-gradient(90deg, #0891b2 0%, #13ead9 100%)',
  reverse: 'linear-gradient(90deg, #13ead9 0%, #0891b2 100%)',
  teal: 'linear-gradient(90deg, #13ead9 0%, #0891b2 100%)',
  tealLight: 'linear-gradient(90deg, #13ead9 0%, #14b8a6 100%)',
  tealDeep: 'linear-gradient(90deg, #0891b2 0%, #0c7594 100%)',
  tealRadial: 'radial-gradient(circle, #13ead9 0%, #0891b2 100%)',
} as const;

// CSS custom properties for Tailwind
export const CSS_VARIABLES = {
  '--color-brand-teal': '#0891b2',
  '--color-brand-teal-light': '#13ead9',
  '--color-brand-teal-dark': '#0c7594',
  '--color-brand-slate': '#334155',
  '--color-brand-slate-dark': '#1e293b',
} as const;