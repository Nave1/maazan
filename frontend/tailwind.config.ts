import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1B4F72",
          light: "#2E86AB",
          pale: "#E8F4F8",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F8FAFE",
          foreground: "#2C3E50",
        },
        success: {
          DEFAULT: "#27AE60",
          light: "#4FD080",
        },
        warning: {
          DEFAULT: "#F39C12",
          light: "#F1C40F",
        },
        destructive: {
          DEFAULT: "#E74C3C",
          light: "#FF6B6B",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8FAFE",
          foreground: "#6C7A89",
        },
        accent: {
          DEFAULT: "#E8F4F8",
          foreground: "#1B4F72",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        hebrew: ["Heebo", "Assistant", "Rubik", "sans-serif"],
        english: ["Inter", "Nunito Sans", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
