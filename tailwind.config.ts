import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A8CFF',
        'primary-hover': '#0B6FE0',
        'accent-red': '#F0436A',
        'accent-yellow': '#F9C31F',
        'accent-green': '#17A673',
        'accent-purple': '#7B5BB5',
      },
      fontFamily: {
        sans: ['var(--font-google-sans)', 'Google Sans', 'sans-serif'],
        'google-sans': ['var(--font-google-sans)', 'Google Sans', 'sans-serif'],
        'be-vietnam': ['var(--font-be-vietnam)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
