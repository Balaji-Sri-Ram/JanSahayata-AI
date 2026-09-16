/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#38aaf6',
          500: '#0e8ee8',
          600: '#0270c6',
          700: '#0359a0',
          800: '#074c84',
          900: '#0c406e',
          950: '#082849',
        },
        civic: {
          50: '#f4f6f8',
          100: '#e6ebf0',
          500: '#475569',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
