/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Cold Experience — Arctic Night Palette
                cold: {
                    50: '#ffffff',
                    100: '#e8f1f8',
                    200: '#c6d4e4',
                    300: '#8ba3be',
                    400: '#5a7a99',
                    500: '#3f7ba7',
                    600: '#285a82',
                    700: '#1a2d42',
                    800: '#142232',
                    850: '#0f1c2a',
                    900: '#0a1622',
                    950: '#040810',
                },
                // Polar Ice Accents
                accent: {
                    DEFAULT: '#3f7ba7',
                    light: '#5a9bc7',
                    lighter: '#7ab8e0',
                    dark: '#285a82',
                    darker: '#1e4a6d',
                },
                // Semantic
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '16px',
                '3xl': '24px',
            },
            boxShadow: {
                'glass': '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(90, 155, 199, 0.1)',
                'glow': '0 0 20px rgba(63, 123, 167, 0.3)',
                'glow-lg': '0 0 40px rgba(63, 123, 167, 0.4)',
            },
            backdropBlur: {
                'xs': '2px',
            },
            animation: {
                'fade-in': 'fade-in 0.4s ease-out forwards',
                'slide-in': 'slide-in 0.3s ease-out forwards',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'glow': 'glow-pulse 3s ease-in-out infinite',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in': {
                    '0%': { opacity: '0', transform: 'translateX(-16px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                },
            },
            transitionTimingFunction: {
                'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
        },
    },
    plugins: [],
}
