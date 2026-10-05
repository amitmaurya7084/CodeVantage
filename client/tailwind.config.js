/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      colors: {
        navy: "#0F172A",
        brand: {
          DEFAULT: "#2563EB", // Primary Blue — buttons, links, CTAs
          dark: "#1D4ED8",
        },
        cyan: "#06B6D4", // Accent only — do not overuse
        surface: "#F8FAFC", // Light section backgrounds
        muted: "#64748B", // Secondary text
        success: "#16A34A",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
