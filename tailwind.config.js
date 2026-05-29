import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#F4F7F9", // Soft Google blue-gray background
            foreground: "#1F2937", // Dark gray text
            primary: {
              DEFAULT: "#059669", // Emerald Green
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#D1FAE5", // Soft emerald for active pills
              foreground: "#065F46", // Dark emerald text
            },
            content1: "#FFFFFF", // Card surface
            content2: "#F8F9FA", // Surface container low
            content3: "#E3E3E3", // Surface container high
            divider: "#E5E7EB",
          },
          layout: {
            radius: {
              small: "0.5rem",
              medium: "1rem", // 16px
              large: "1.75rem", // 28px (Material 3 Cards)
            },
            borderWidth: {
              small: "1px",
              medium: "1px",
              large: "2px",
            },
            boxShadow: {
              small: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              medium: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
              large: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
            },
          },
        },
      },
    }),
  ],
}
