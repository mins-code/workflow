// frontend/tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {

        // --- Dark Mode Palette ---
        'dark-bg': '#0d1b2a',          // Rich Black
        'dark-surface': '#1b263b',     // Oxford Blue
        'dark-surface-light': '#415a77', // Yinmn Blue (for subtle borders/hover)
        'dark-accent': '#778da9',      // Silver Lake Blue
        'dark-text': '#e0e1dd',        // Platinum
        'dark-muted': '#415a77',       // Yinmn Blue
        
        // ... (existing dark mode colors)
        
        // --- New Periwinkle Palette (for Project View) ---
        'page-bg-light': '#e0e1dd',     // Jordy Blue (Darker Background)
        'card-bg-light': '#e0e1dd',     // Periwinkle 2 (Lighter Card)
        'periwinkle-mid': '#b6ccfe',    // Periwinkle 3 (Mid-tone)
        'dark-text-color': '#0f1724',   // Reintroduce dark text for light backgrounds

        // ... (rest of the colors)

        mb: {
          50:  '#0d1b2a',
          100: '#1b263b', 
          200: '#415a77', 
          300: '#778da9',
          400: '#778da9',
          500: '#778da9', // primary accent (Silver Lake Blue)
          600: '#415a77', // secondary accent/darker gradient (Yinmn Blue)
          700: '#415a77',
          800: '#415a77',
          900: '#e0e1dd' // primary text (Platinum)
        },

        neutral: {
          50: '#1b263b',
          100: '#1b263b',
          200: '#415a77',
          300: '#778da9',
          400: '#778da9',
          500: '#778da9',
          600: '#778da9',
          700: '#e0e1dd',
          800: '#e0e1dd',
          900: '#e0e1dd'
        },
        glass: 'rgba(255,255,255,0.1)'
      },
      borderRadius: {
        'xl-2': '1.25rem',
        '2xl-3': '1.75rem'
      },
      boxShadow: {
        // Darker shadows for dark mode subtlety
        'mb-soft': '0 6px 20px rgba(11,24,39,0.2)',
        'mb-elev': '0 10px 30px rgba(11,24,39,0.3)'
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