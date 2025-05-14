/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        groww: {
          blue: '#00d09c',
          dark: '#1e2232',
          gray: '#44475b',
          light: '#f9fafb',
          background: {
            light: '#ffffff',
            dark: '#1a1b1e'
          },
          border: {
            light: '#e5e7eb',
            dark: '#2d2e33'
          },
          card: {
            light: '#ffffff',
            dark: '#25262b'
          }
        }
      },
      boxShadow: {
        'groww': '0 4px 6px -1px rgba(0, 208, 156, 0.1), 0 2px 4px -1px rgba(0, 208, 156, 0.06)',
        'groww-lg': '0 10px 15px -3px rgba(0, 208, 156, 0.1), 0 4px 6px -2px rgba(0, 208, 156, 0.05)',
        'groww-3d': '0 20px 25px -5px rgba(0, 208, 156, 0.1), 0 10px 10px -5px rgba(0, 208, 156, 0.04)',
        'groww-inner': 'inset 0 2px 4px 0 rgba(0, 208, 156, 0.06)'
      }
    },
  },
  plugins: [],
};