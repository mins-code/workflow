// frontend/tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        mb: {
          50:  '#fbfdfc',
          100: '#f6fbf8',
          200: '#eaf7ef',
          300: '#d7f0dd',
          400: '#b7e6c8',
          500: '#6fd39d', // main accent
          600: '#4dbf7e',
          700: '#348f59',
          800: '#216b41',
          900: '#0f4726'
        },
        neutral: {
          50: '#fbfbfb',
          100: '#f6f7f8',
          200: '#e9edf0',
          300: '#d9e3e8',
          400: '#bfcfd6',
          500: '#9fb0bb',
          600: '#73858f',
          700: '#4a5560',
          800: '#2b3640',
          900: '#121619'
        },
        glass: 'rgba(255,255,255,0.6)'
      },
      borderRadius: {
        'xl-2': '1.25rem',
        '2xl-3': '1.75rem'
      },
      boxShadow: {
        'mb-soft': '0 6px 20px rgba(11,24,39,0.08)',
        'mb-elev': '0 10px 30px rgba(11,24,39,0.12)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
}