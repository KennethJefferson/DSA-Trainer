import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: "#7f13ec",
          hover: "#6b10c6",
          light: "#9333ea",
          dark: "#5b0db3",
        },
        // Background colors
        background: {
          DEFAULT: "#191022",
          dark: "#121212",
          light: "#f7f6f8",
        },
        // Surface colors (cards, panels)
        surface: {
          DEFAULT: "#261933",
          dark: "#1e1e24",
          light: "#2a1d36",
          border: "#362348",
        },
        // Card colors (from mockups)
        card: {
          DEFAULT: "#261933",
          dark: "#362348",
          hover: "#3d2a54",
        },
        // Border colors (from mockups)
        border: {
          DEFAULT: "#362348",
          dark: "#4d3267",
          light: "#ffffff10",
        },
        // Text colors
        text: {
          main: "#f7f6f8",
          muted: "#ad92c9",
          dark: "#1a1a1a",
        },
        // Semantic colors
        success: {
          DEFAULT: "#10b981",
          light: "#34d399",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        error: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
        info: {
          DEFAULT: "#3b82f6",
          light: "#60a5fa",
          dark: "#2563eb",
        },
      },
      fontFamily: {
        display: ["Lexend", "system-ui", "sans-serif"],
        body: ["Noto Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 20px rgba(127, 19, 236, 0.3)",
        "glow-sm": "0 0 10px rgba(127, 19, 236, 0.2)",
        "glow-lg": "0 0 30px rgba(127, 19, 236, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
