/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pin: {
          red: "#e60023",
          redHover: "#ad081b",
          redLight: "#fde8ea",
          dark: "#111111",
          gray: "#767676",
          pill: "#e9e9e9",
          pillHover: "#d9d9d9",
          surface: "#f7f7f7",
          border: "#e5e5e5",
        },
        primary: {
          50: "#fde8ea",
          100: "#fbd1d5",
          200: "#f7a3ab",
          500: "#e60023",
          600: "#c7001f",
          700: "#a6001a",
          800: "#850015",
          900: "#630010",
        }
      },
      animation: {
        "pulse-subtle": "pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-slow": "floatSlow 4s ease-in-out infinite",
        "float-reverse": "floatReverse 5s ease-in-out infinite",
      },
      keyframes: {
        pulseSubtle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.2)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(8px)" },
        }
      }
    },
  },
  plugins: [],
}
