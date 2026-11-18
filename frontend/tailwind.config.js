/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Indian Civic / Government Blue Palette
        gov: {
          50: '#f0f5fc',
          100: '#e2ecf8',
          200: '#c5daf1',
          300: '#96bee6',
          400: '#5f9cd7',
          500: '#3a7ec6',
          600: '#2763ab',
          700: '#1e4f8b',
          800: '#1a4373',
          900: '#0b2545', // Official Ashoka Deep Navy
          950: '#07172b',
        },
        // Deep Navy structured header palette
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0b2545',
          950: '#061323',
        },
        // Indian Tiranga National Colors
        tiranga: {
          saffron: '#e86100',
          saffronDark: '#c2410c',
          saffronLight: '#fff7ed',
          green: '#138808',
          greenDark: '#166534',
          greenLight: '#f0fdf4',
          chakra: '#000080',
        },
        civic: {
          saffron: '#e86100',
          saffronLight: '#fff4eb',
          green: '#138808',
          greenLight: '#eef9ef',
          ashoka: '#000080',
        },
        // Backward compatibility
        railway: {
          50: '#f0f6ff',
          100: '#e0edfe',
          500: '#0e88e8',
          600: '#026bc4',
          700: '#03549d',
          900: '#0c3d6c',
          950: '#082545',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'Mangal', 'sans-serif'],
      },
      borderRadius: {
        'gov': '6px',
        'gov-md': '8px',
        'gov-lg': '12px',
      },
      boxShadow: {
        'gov-card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'gov-hover': '0 4px 10px -1px rgba(11, 37, 69, 0.12), 0 2px 4px -2px rgba(11, 37, 69, 0.06)',
        'gov-banner': '0 10px 25px -5px rgba(11, 37, 69, 0.25)',
      }
    },
  },
  plugins: [],
}
