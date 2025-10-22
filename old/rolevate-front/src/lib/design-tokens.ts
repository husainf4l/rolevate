/**
 * Design Tokens for Rolevate - Apple-Style Minimal Modern Design System
 *
 * This file contains standardized design tokens for colors, shadows, spacing,
 * typography, and other design elements to ensure consistency across the application.
 */

export const DesignTokens = {
  // Colors - Solid only (Apple-style minimalism)
  colors: {
    primary: '#0891b2',
    primaryHover: '#0c7594',
    text: {
      primary: '#1d1d1f',
      secondary: '#6b7280',
      tertiary: '#9ca3af'
    },
    background: {
      primary: '#ffffff',
      secondary: '#fafbfc',
      tertiary: '#f5f5f7'
    },
    border: {
      subtle: 'rgba(0, 0, 0, 0.06)',
      medium: 'rgba(0, 0, 0, 0.08)',
      strong: 'rgba(0, 0, 0, 0.12)'
    }
  },

  // Shadows - 3-tier system (Apple-style)
  shadows: {
    subtle: '0 1px 3px rgba(0, 0, 0, 0.04)', // Cards at rest
    medium: '0 4px 12px rgba(0, 0, 0, 0.08)', // Hover states, dropdowns
    strong: '0 8px 24px rgba(0, 0, 0, 0.12)'  // Modals, popovers
  },

  // Border Radius - Consistent minimal values
  radius: {
    button: '8px',     // rounded-lg
    card: '12px',      // rounded-xl
    panel: '16px',     // rounded-2xl
    modal: '20px',     // rounded-3xl
    circle: '9999px'   // rounded-full
  },

  // Spacing - 8px base scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  },

  // Typography - Apple SF Pro system
  typography: {
    fontFamily: {
      display: '-apple-system, SF Pro Display, sans-serif',
      text: '-apple-system, SF Pro Text, sans-serif',
      mono: 'SF Mono, Monaco, Cascadia Code, Roboto Mono, monospace'
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.6
    },
    letterSpacing: {
      tight: '-0.03em',
      normal: '0em',
      wide: '0.025em'
    }
  },

  // Transitions - Apple-style smooth animations
  transitions: {
    fast: '150ms ease-out',
    normal: '300ms ease-out',
    slow: '500ms ease-out'
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modal: 40,
    popover: 50,
    tooltip: 60
  },

  // Breakpoints (Tailwind standard)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
} as const;

// Type exports for TypeScript
export type DesignTokenColors = typeof DesignTokens.colors;
export type DesignTokenShadows = typeof DesignTokens.shadows;
export type DesignTokenRadius = typeof DesignTokens.radius;
export type DesignTokenSpacing = typeof DesignTokens.spacing;
export type DesignTokenTypography = typeof DesignTokens.typography;

// Utility functions for consistent token usage
export const getShadow = (level: keyof typeof DesignTokens.shadows) => DesignTokens.shadows[level];
export const getRadius = (size: keyof typeof DesignTokens.radius) => DesignTokens.radius[size];
export const getSpacing = (size: keyof typeof DesignTokens.spacing) => DesignTokens.spacing[size];
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = DesignTokens.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};