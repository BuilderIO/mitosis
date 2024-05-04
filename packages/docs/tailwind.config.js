const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#AC7EF4',
        'primary-light': '#CCAFFB',
        'primary-dark': '#221931',
        purple: {
          990: '#120D19',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
