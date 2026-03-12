// tailwind.config.mjs
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0069b4',
          50: '#e6f0f9',
          100: '#cce1f3',
          200: '#99c2e7',
          300: '#66a4db',
          400: '#3385cf',
          500: '#0069b4',
          600: '#005490',
          700: '#003f6c',
          800: '#002a48',
          900: '#001524',
        },
        sidebar: 'rgb(var(--sidebar))',
        'sidebar-border': 'rgb(var(--sidebar-border))',
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
