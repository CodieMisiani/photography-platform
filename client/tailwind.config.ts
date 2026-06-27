import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        paper: "#FFFFFF",
        grey: "#6B6B6B",
        "grey-light": "#E5E2E1",
        "grey-faint": "#F4F2F1",
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        full: "0px",
      },
      boxShadow: {
        none: "none",
      },
      fontFamily: {
        display: ["Archivo", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
