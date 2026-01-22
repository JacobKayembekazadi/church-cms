/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        blob: 'blob 20s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '25%': {
            transform: 'translate(20px, -50px) scale(1.1)',
          },
          '50%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '75%': {
            transform: 'translate(50px, 50px) scale(1.05)',
          },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-purple-50',
    'bg-purple-100',
    'bg-pink-50',
    'bg-pink-100',
    'bg-blue-50',
    'bg-blue-100',
    'bg-emerald-50',
    'bg-emerald-100',
    'text-purple-600',
    'text-pink-600',
    'text-blue-600',
    'text-emerald-600',
  ],
};
