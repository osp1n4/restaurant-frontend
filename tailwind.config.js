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
        "primary": "#ec5b13",
        "background-light": "#f8f6f6",
        "background-dark": "#221610",
        "card-light": "#ffffff",
        "card-dark": "#2d1d14",
        "text-light": "#181311",
        "text-dark": "#f8f6f6",
        "subtext-light": "#896f61",
        "subtext-dark": "#b0a199",
        "border-light": "#e6dfdb",
        "border-dark": "#4e3a30",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}

