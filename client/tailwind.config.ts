import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#0077B5",
          hover: "#005f91",
          subtle: "#e8f4fb",
          muted: "rgba(0, 119, 181, 0.15)",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          rich: "#171514",
          studio: "#24201E",
          warm: "#3A3430",
        },
        paper: {
          DEFAULT: "#FAF8F5",
          warm: "#F4F0EA",
          deep: "#E7E0D7",
          white: "#FFFFFF",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#4D4742",
          muted: "#7A716A",
          inverse: "#FAF8F5",
        },
        grey: "#7A716A",
        "grey-light": "#E7E0D7",
        "grey-faint": "#F4F0EA",
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
        editorial: "0 18px 60px rgba(23, 21, 20, 0.08)",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
