/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003366', // Heraldic Blue
          light: '#007FFF',   // Azure Bright
          dark: '#001F3F',    // Deep Blue
        },
        secondary: {
          DEFAULT: '#C0C0C0', // Silver
          light: '#E5E5E5',   // Light Gray
          dark: '#A9A9A9',    // Dark Gray
        },
        accent: {
          green: '#228B22',   // Forest Green
          red: '#DC143C',     // Crimson
          gold: '#FFD700',    // Gold
        },
        background: '#FFFFFF',
        'text-primary': '#000000',
        'text-secondary': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'rugby-ball-spin': 'rugbyBallSpin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        rugbyBallSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'neumorphic': '5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.8)',
        'neumorphic-inset': 'inset 5px 5px 10px rgba(0, 0, 0, 0.1), inset -5px -5px 10px rgba(255, 255, 255, 0.8)',
        'rugby-field': '0 4px 20px rgba(34, 139, 34, 0.3)',
      },
      backgroundImage: {
        'rugby-gradient': 'linear-gradient(135deg, #003366 0%, #001F3F 100%)',
        'field-gradient': 'linear-gradient(180deg, #228B22 0%, #32CD32 100%)',
        'silver-gradient': 'linear-gradient(135deg, #C0C0C0 0%, #E5E5E5 100%)',
      },
      borderRadius: {
        'rugby': '12px',
        'card': '16px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
}
