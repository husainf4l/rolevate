import type { Config } from 'tailwindcss';

export default {
    content: [
        './src/**/*.{html,ts}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                'rolevate': {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0891b2', // Primary
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                'apple': {
                    gray: {
                        800: '#48484a',
                        900: '#1d1d1f',
                    },
                    green: '#30d158',
                    orange: '#ff9500',
                    red: '#ff3b30',
                    purple: '#af52de',
                }
            },
            borderRadius: {
                'apple': '10px',
                'apple-lg': '16px',
            },
            fontFamily: {
                'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
            }
        },
    },
    plugins: [],
} satisfies Config;
