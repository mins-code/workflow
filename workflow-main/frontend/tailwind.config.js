// frontend/tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Modern Dark Theme Palette
        'dark-bg': '#0a0e1a',          // Deeper rich black
        'dark-bg-secondary': '#0f1419', // Secondary background
        'dark-surface': '#1a1f2e',     // Card backgrounds
        'dark-surface-light': '#252b3b', // Hover states
        'dark-border': '#2d3548',      // Borders
        
        // Accent Colors
        'primary': '#6366f1',          // Indigo - Primary actions
        'primary-hover': '#4f46e5',    // Darker indigo
        'secondary': '#8b5cf6',        // Purple - Secondary actions
        'accent': '#06b6d4',           // Cyan - Highlights
        'accent-hover': '#0891b2',     // Darker cyan
        
        // Text Colors
        'dark-text': '#f0f4f8',        // Primary text - High contrast
        'dark-text-secondary': '#cbd5e1', // Secondary text
        'dark-muted': '#94a3b8',       // Muted text
        
        // Status Colors
        'success': '#10b981',
        'success-dark': '#059669',
        'warning': '#f59e0b',
        'warning-dark': '#d97706',
        'error': '#ef4444',
        'error-dark': '#dc2626',
        
        // Light backgrounds for forms (with good contrast)
        'input-bg': '#1e293b',
        'input-border': '#334155',
        'input-focus': '#3b82f6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        'gradient-surface': 'linear-gradient(135deg, #1a1f2e 0%, #252b3b 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
}