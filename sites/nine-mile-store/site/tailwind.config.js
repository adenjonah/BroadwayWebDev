/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors - warm brown tones
        primary: {
          light: '#b98b55', // light wheat/tan
          DEFAULT: '#8c6239', // warm medium brown
          dark: '#5f4126', // dark brown
        },
        // Secondary/accent colors - muted green tones
        secondary: {
          light: '#d1d2c4', // light sage
          DEFAULT: '#778066', // muted green
          dark: '#474a3f', // dark olive
        },
        // Sale colors
        sale: {
          regular: '#686756', // muted olive
          discount: '#b3544f', // muted rust red
        },
        // Status colors
        status: {
          success: '#5f7052', // forest green
          warning: '#d6ad60', // wheat/gold
          error: '#a44a3f', // brick red
          info: '#7d8ba1', // muted blue
        },
        // Background colors
        background: {
          light: '#f5f3ed', // off-white/eggshell
          DEFAULT: '#e9e5dc', // light beige
          dark: '#d8d2c3', // warm taupe
          alternate: '#ede8de', // warm cream
        },
        // Text colors
        textColor: {
          primary: '#33302e', // almost black
          secondary: '#5f5b56', // dark gray
          disabled: '#9c9996', // medium gray
          inverse: '#f9f7f2', // off-white
        },
      },
      // Add box shadow using our variables
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
      },
      // Add border radius using our variables
      borderRadius: {
        'theme-sm': 'var(--radius-sm)',
        'theme-md': 'var(--radius-md)',
        'theme-lg': 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
}; 