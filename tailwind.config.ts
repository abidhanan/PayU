import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef3ff",
          100: "#dbe5ff",
          200: "#bccfff",
          300: "#8dabff",
          400: "#577dff",
          500: "#2f56f5",
          600: "#1d3fe0",
          700: "#1832b8",
          800: "#1a2f91",
          900: "#1b2d73",
          950: "#141c47",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgba(16, 24, 64, 0.08), 0 6px 24px -8px rgba(16, 24, 64, 0.10)",
        glow: "0 8px 30px -6px rgba(47, 86, 245, 0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
