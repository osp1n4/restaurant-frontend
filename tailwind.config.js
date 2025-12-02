/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: {
          DEFAULT: '#F5F5F5',
          light: '#FFFFFF',
        },
        text: {
          DEFAULT: '#222222',
          muted: '#666666',
        },
        neutral: {
          inactive: '#CCCCCC',
        },
        // Mantener claves anteriores si se usan en componentes
        "background-light": "#F5F5F5",
        "background-dark": "#221610",
        "card-light": "#FFFFFF",
        "card-dark": "#2d1d14",
        "text-light": "#222222",
        "text-dark": "#F5F5F5",
        "subtext-light": "#666666",
        "subtext-dark": "#b0a199",
        "border-light": "#e6dfdb",
        "border-dark": "#4e3a30",
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'system-ui', 'Arial', 'sans-serif'],
        display: ['Inter', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      boxShadow: {
        subtle: '0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}

