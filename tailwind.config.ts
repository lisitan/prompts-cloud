import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"LXGW WenKai Screen"', '-apple-system', 'sans-serif'],
      },
      colors: {
        // 重新调教的灰阶，适配深色模式
        zinc: {
          50: '#f9fafb',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0,0,0,0.03)',
        'glow': '0 0 20px rgba(255,255,255,0.05)',
      },
      animation: {
        'check-in': 'checkIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        checkIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
