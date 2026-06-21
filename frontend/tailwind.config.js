/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background': '#131313', 'surface': '#131313', 'surface-dim': '#131313',
        'surface-container-lowest': '#0e0e0e', 'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f', 'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534', 'surface-variant': '#353534',
        'surface-bright': '#3a3939', 'on-background': '#e5e2e1', 'on-surface': '#e5e2e1',
        'on-surface-variant': '#b9cacb', 'outline': '#849495', 'outline-variant': '#3a494b',
        'primary': '#e1fdff', 'primary-container': '#00f2ff', 'on-primary': '#00363a',
        'on-primary-container': '#006a71', 'primary-fixed': '#74f5ff', 'primary-fixed-dim': '#00dbe7',
        'secondary': '#dcb8ff', 'secondary-container': '#7701d0',
        'tertiary': '#fff5f5', 'tertiary-container': '#ffcfd2',
        'error': '#ffb4ab', 'error-container': '#93000a',
        'inverse-surface': '#e5e2e1', 'inverse-on-surface': '#313030',
        'inverse-primary': '#00696f', 'surface-tint': '#00dbe7',
      },
      borderRadius: { DEFAULT: '0.125rem', lg: '0.25rem', xl: '0.5rem', full: '0.75rem' },
      spacing: {
        'max-width': '1440px', 'gutter': '24px',
        'margin-desktop': '64px', 'base': '8px', 'margin-mobile': '20px',
      },
      fontFamily: {
        'label-md': ['JetBrains Mono'], 'body-md': ['Inter'], 'label-sm': ['JetBrains Mono'],
        'headline-lg': ['Space Grotesk'], 'body-lg': ['Inter'],
        'display-lg': ['Space Grotesk'], 'headline-md': ['Space Grotesk'],
      },
      fontSize: {
        'label-md':   ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '500' }],
        'body-md':    ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-sm':   ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'headline-lg':['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-lg':    ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'display-lg': ['72px', { lineHeight: '80px', letterSpacing: '-0.04em', fontWeight: '700' }],
        'headline-md':['24px', { lineHeight: '32px', fontWeight: '600' }],
      },
      animationDuration: { DEFAULT: '300ms' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
