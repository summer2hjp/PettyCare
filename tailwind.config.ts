import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Outfit', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },

      // =========================================
      // MiniMax Color Palette
      // =========================================
      colors: {
        brand: {
          blue: '#1456f0',
          'sky': '#3daeff',
          pink: '#ea5ec1',
          deep: '#17437d',
        },
        primary: {
          200: '#bfdbfe',
          light: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        text: {
          primary: '#222222',
          dark: '#18181b',
          secondary: '#45515e',
          muted: '#8e8e93',
          helper: '#5f5f5f',
        },
        surface: {
          white: '#ffffff',
          light: '#f0f0f0',
          'glass-white': 'hsla(0, 0%, 100%, 0.4)',
          dark: '#181e25',
        },
        border: {
          light: '#f2f3f5',
          gray: '#e5e7eb',
        },
        semantic: {
          success: '#e8ffea',
          error: '#fee2e2',
          warning: '#fef3c7',
        },

        /* ── Semantic tokens (CSS variables — auto-switch with .dark) ── */
        label: 'var(--mm-label)',
        secondaryLabel: 'var(--mm-secondaryLabel)',
        tertiaryLabel: 'var(--mm-tertiaryLabel)',
        mutedLabel: 'var(--mm-mutedLabel)',
        separator: 'var(--mm-separator)',
        link: 'var(--mm-link)',
        background: 'var(--mm-background)',
        secondaryBackground: 'var(--mm-secondaryBackground)',
        card: 'var(--mm-card)',
        cardHover: 'var(--mm-cardHover)',
        fill: 'var(--mm-fill)',
        secondaryFill: 'var(--mm-secondaryFill)',

        health: {
          excellent: '#34C759',
          good: '#7DCF5C',
          fair: '#FFCC00',
          poor: '#FF9500',
          critical: '#FF3B30',
        },
      },

      // =========================================
      // MiniMax Typography Scale
      // =========================================
      fontSize: {
        'mm-hero': ['80px', { lineHeight: '1.10', fontWeight: '500', fontFamily: 'Outfit' }],
        'mm-section': ['31px', { lineHeight: '1.50', fontWeight: '600', fontFamily: 'Outfit' }],
        'mm-section-alt': ['32px', { lineHeight: '0.88', fontWeight: '600' }],
        'mm-card-title': ['28px', { lineHeight: '1.71', fontWeight: '600', fontFamily: 'Outfit' }],
        'mm-subheading': ['24px', { lineHeight: '1.50', fontWeight: '500', fontFamily: 'Poppins' }],
        'mm-feature': ['18px', { lineHeight: '1.50', fontWeight: '500', fontFamily: 'Poppins' }],
        'mm-body-large': ['20px', { lineHeight: '1.50', fontWeight: '500' }],
        'mm-body': ['16px', { lineHeight: '1.50', fontWeight: '400' }],
        'mm-body-bold': ['16px', { lineHeight: '1.50', fontWeight: '700' }],
        'mm-nav': ['14px', { lineHeight: '1.50', fontWeight: '500' }],
        'mm-button': ['13px', { lineHeight: '1.50', fontWeight: '600' }],
        'mm-caption': ['13px', { lineHeight: '1.70', fontWeight: '400' }],
        'mm-small': ['12px', { lineHeight: '1.50', fontWeight: '500' }],
        'mm-micro': ['10px', { lineHeight: '1.50', fontWeight: '400' }],

        // Legacy Apple aliases (will be phased out)
        'apple-large-title': ['28px', { lineHeight: '1.71', fontWeight: '600' }],
        'apple-title-1': ['24px', { lineHeight: '1.50', fontWeight: '600' }],
        'apple-title-2': ['22px', { lineHeight: '1.50', fontWeight: '600' }],
        'apple-title-3': ['20px', { lineHeight: '1.50', fontWeight: '600' }],
        'apple-headline': ['16px', { lineHeight: '1.50', fontWeight: '600' }],
        'apple-body': ['16px', { lineHeight: '1.50', fontWeight: '400' }],
        'apple-callout': ['15px', { lineHeight: '1.50', fontWeight: '400' }],
        'apple-subhead': ['14px', { lineHeight: '1.50', fontWeight: '400' }],
        'apple-footnote': ['13px', { lineHeight: '1.50', fontWeight: '400' }],
        'apple-caption-1': ['12px', { lineHeight: '1.50', fontWeight: '400' }],
        'apple-caption-2': ['11px', { lineHeight: '1.50', fontWeight: '400' }],
      },

      // =========================================
      // MiniMax Spacing (8px base)
      // =========================================
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '2.5': '20px',
        '3': '24px',
        '3.5': '28px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
        '9': '72px',
        '10': '80px',
        '11': '88px',
        '12': '96px',
      },

      // =========================================
      // MiniMax Border Radius
      // =========================================
      borderRadius: {
        'mm-sm': '8px',
        'mm-md': '13px',
        'mm-lg': '16px',
        'mm-xl': '20px',
        'mm-2xl': '24px',
        'mm-pill': '9999px',
        // Legacy aliases
        'apple': '8px',
        'apple-lg': '12px',
        'apple-xl': '16px',
        'apple-2xl': '20px',
        'apple-full': '9999px',
      },

      // =========================================
      // MiniMax Shadows
      // =========================================
      boxShadow: {
        'mm-subtle': 'rgba(0, 0, 0, 0.08) 0px 4px 6px',
        'mm-ambient': 'rgba(0, 0, 0, 0.08) 0px 0px 22.576px',
        'mm-brand': 'rgba(44, 30, 116, 0.16) 0px 0px 15px',
        'mm-brand-offset': 'rgba(44, 30, 116, 0.11) 6.5px 2px 17.5px',
        'mm-card': 'rgba(36, 36, 36, 0.08) 0px 12px 16px -4px',
        // Legacy aliases
        'apple-sm': 'rgba(0, 0, 0, 0.08) 0px 4px 6px',
        'apple-md': 'rgba(0, 0, 0, 0.08) 0px 0px 22.576px',
        'apple-lg': 'rgba(36, 36, 36, 0.08) 0px 12px 16px -4px',
        'apple-xl': 'rgba(44, 30, 116, 0.16) 0px 0px 15px',
        'dark-apple-md': 'rgba(0, 0, 0, 0.32) 0px 2px 8px',
        'dark-apple-lg': 'rgba(0, 0, 0, 0.40) 0px 4px 16px',
        'dark-apple-xl': 'rgba(0, 0, 0, 0.48) 0px 8px 32px',
      },

      // =========================================
      // Transition Timing
      // =========================================
      transitionTimingFunction: {
        'mm-smooth': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'mm-spring': 'cubic-bezier(0.32, 0.94, 0.60, 1)',
        'mm-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // =========================================
      // Animation Keyframes
      // =========================================
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s mm-smooth',
        'slide-up': 'slide-up 0.35s mm-spring',
        'scale-in': 'scale-in 0.3s mm-spring',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        skeleton: 'skeleton-shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
