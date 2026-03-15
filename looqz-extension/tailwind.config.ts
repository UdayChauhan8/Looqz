import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "./src/popup/index.html"],
  theme: {
    extend: {
      colors: {
        bg:        "#0A0A0F",
        surface:   "#13131A",
        elevated:  "#1C1C26",
        border:    "#2A2A38",
        primary:   "#7C6FFF",
        "primary-hover": "#9B90FF",
        "text-primary":  "#F0EFFF",
        "text-secondary": "#8B8AA8",
        success:   "#4ADE80",
        error:     "#F87171",
      },
      fontFamily: {
        sans:    ["DM Sans", "sans-serif"],
        display: ["DM Serif Display", "serif"],
      },
      borderRadius: {
        card: "12px",
        btn:  "8px",
      },
    },
  },
  plugins: [],
} satisfies Config;
