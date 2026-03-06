/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0A5ED7',
        accent: '#FF8A1F',
        stripe: '#635BFF',
        surface: '#F4F6FA',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        error: '#DC2626',
      },
    },
  },
  plugins: [],
};
