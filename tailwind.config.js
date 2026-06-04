/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — green
        'primary':                   '#005129',
        'on-primary':                '#ffffff',
        'primary-container':         '#1a6b3c',
        'on-primary-container':      '#ffffff',
        'primary-fixed':             '#7dc390',

        // Secondary — yellow/amber
        'secondary':                 '#F4A817',
        'on-secondary':              '#1a1a00',
        'secondary-container':       '#fcaf21',
        'on-secondary-container':    '#1a1200',
        'secondary-fixed':           '#fcaf21',

        // Surface
        'background':                '#f8f9fb',
        'on-background':             '#1a1c1a',
        'surface':                   '#f8f9fb',
        'on-surface':                '#1a1c1a',
        'surface-variant':           '#dde5da',
        'on-surface-variant':        '#414941',
        'surface-container-lowest':  '#ffffff',
        'surface-container-low':     '#f2f4f0',
        'surface-container':         '#ecefea',
        'surface-container-high':    '#e6e9e4',
        'surface-container-highest': '#e0e3de',

        // Outline
        'outline':                   '#717970',
        'outline-variant':           '#c1c9bf',
      },
      spacing: {
        'xs':   '4px',
        'sm':   '8px',
        'md':   '16px',
        'lg':   '24px',
        'xl':   '40px',
        '2xl':  '64px',
        'container-margin': '24px',
        'margin-mobile':    '16px',
        'margin-desktop':   '40px',
        'gutter':           '24px',
      },
      maxWidth: {
        'container-max': '1280px',
      },
      fontFamily: {
        'headline': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body':     ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
