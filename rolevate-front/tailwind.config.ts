import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          teal: {
            light: '#13ead9',
            DEFAULT: '#0891b2',
            dark: '#0c7594',
          },
          slate: {
            DEFAULT: '#334155',
            dark: '#1e293b',
          }
        },
        // Primary color shortcuts
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0891b2', // Our main brand color
          700: '#0c7594',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        }
      },
      fontFamily: {
        'display': ['-apple-system', 'SF Pro Display', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        'text': ['-apple-system', 'SF Pro Text', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        '4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #0891b2 0%, #334155 100%)',
        'brand-gradient-reverse': 'linear-gradient(90deg, #334155 0%, #0891b2 100%)',
        'brand-gradient-subtle': 'linear-gradient(90deg, #0891b2 0%, #13ead9 100%)',
        'teal-gradient': 'linear-gradient(90deg, #13ead9 0%, #0891b2 100%)',
        'teal-gradient-light': 'linear-gradient(90deg, #13ead9 0%, #14b8a6 100%)',
        'teal-gradient-deep': 'linear-gradient(90deg, #0891b2 0%, #0c7594 100%)',
        'teal-gradient-radial': 'radial-gradient(circle, #13ead9 0%, #0891b2 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        'corporate': '0 2px 24px rgba(8, 145, 178, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
};

export default config;