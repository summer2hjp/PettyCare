import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // =========================================
      // Apple HIG Semantic Colors
      // =========================================
      colors: {
        apple: {
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          mint: '#00C7BE',
          teal: '#30B0C7',
          cyan: '#32ADE6',
          blue: '#007AFF',
          indigo: '#5856D6',
          purple: '#AF52DE',
          pink: '#FF2D55',
          brown: '#A2845E',

          label: '#000000',
          secondaryLabel: '#3C3C4399',
          tertiaryLabel: '#3C3C434C',
          quaternaryLabel: '#3C3C432E',
          placeholderText: '#3C3C434C',
          separator: '#3C3C4349',
          opaqueSeparator: '#C6C6C8',
          link: '#007AFF',
          systemBackground: '#FFFFFF',
          secondarySystemBackground: '#F2F2F7',
          tertiarySystemBackground: '#FFFFFF',
          systemGroupedBackground: '#F2F2F7',
          secondarySystemGroupedBackground: '#FFFFFF',
          tertiarySystemGroupedBackground: '#F2F2F7',
          fill: '#78788033',
          secondaryFill: '#78788028',
          tertiaryFill: '#7676801E',
          quaternaryFill: '#74748014',

          'dark-label': '#FFFFFF',
          'dark-secondaryLabel': '#EBEBF599',
          'dark-tertiaryLabel': '#EBEBF54D',
          'dark-quaternaryLabel': '#EBEBF52E',
          'dark-separator': '#38383A',
          'dark-opaqueSeparator': '#38383A',
          'dark-systemBackground': '#1C1C1E',
          'dark-secondarySystemBackground': '#2C2C2E',
          'dark-tertiarySystemBackground': '#3A3A3C',
          'dark-systemGroupedBackground': '#1C1C1E',
          'dark-secondarySystemGroupedBackground': '#2C2C2E',
          'dark-tertiarySystemGroupedBackground': '#3A3A3C',
          'dark-fill': '#7878805C',
          'dark-secondaryFill': '#78788047',
          'dark-tertiaryFill': '#7676803D',
          'dark-quaternaryFill': '#76768030',

          health: {
            excellent: '#34C759',
            good: '#7DCF5C',
            fair: '#FFCC00',
            poor: '#FF9500',
            critical: '#FF3B30',
          },
        },
      },

      // =========================================
      // SF Font Size Hierarchy
      // =========================================
      fontSize: {
        'apple-large-title': ['34px', { lineHeight: '41px', fontWeight: '700' }],
        'apple-title-1': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'apple-title-2': ['22px', { lineHeight: '28px', fontWeight: '700' }],
        'apple-title-3': ['20px', { lineHeight: '25px', fontWeight: '600' }],
        'apple-headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'apple-body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'apple-callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'apple-subhead': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'apple-footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'apple-caption-1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'apple-caption-2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
      },

      // =========================================
      // 8pt Grid Spacing System
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
      // Apple-style Border Radius
      // =========================================
      borderRadius: {
        apple: '10px',
        'apple-lg': '12px',
        'apple-xl': '16px',
        'apple-2xl': '20px',
        'apple-full': '9999px',
      },

      // =========================================
      // Apple-style Shadows
      // =========================================
      boxShadow: {
        'apple-sm': '0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)',
        'apple-md': '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'apple-lg': '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'apple-xl': '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)',
        'apple-2xl': '0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        'dark-apple-sm': '0 1px 2px rgba(0,0,0,0.24), 0 1px 4px rgba(0,0,0,0.16)',
        'dark-apple-md': '0 2px 8px rgba(0,0,0,0.32), 0 1px 2px rgba(0,0,0,0.24)',
        'dark-apple-lg': '0 4px 16px rgba(0,0,0,0.40), 0 2px 4px rgba(0,0,0,0.24)',
        'dark-apple-xl': '0 8px 32px rgba(0,0,0,0.48), 0 2px 8px rgba(0,0,0,0.24)',
      },

      // =========================================
      // Backdrop Blur (Frosted Glass)
      // =========================================
      backdropBlur: {
        'apple-light': '20px',
        'apple-md': '40px',
        'apple-heavy': '60px',
      },

      // =========================================
      // Transition Timing Functions
      // =========================================
      transitionTimingFunction: {
        'apple-spring': 'cubic-bezier(0.32, 0.94, 0.60, 1)',
        'apple-smooth': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'apple-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
        'fade-in': 'fade-in 0.3s apple-smooth',
        'slide-up': 'slide-up 0.35s apple-spring',
        'scale-in': 'scale-in 0.3s apple-spring',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        skeleton: 'skeleton-shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
