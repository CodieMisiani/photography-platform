import type { Config } from "tailwindcss";

// COLOR AUDIT
// Current active/hover color token: ink (#1A1A1A) over grey (#6B6B6B)
// CTA button component: client/src/components/ui/Button.tsx - motion-button border/text ink with ink hover fill
// Navbar active link: client/src/components/Header.tsx + client/src/styles/globals.css - nav-link active uses ink/currentColor underline
// Admin active link: client/src/components/layout/AdminShell.tsx - border-l/text ink with underline
// Badge/tag components: client/src/components/ui/StatusText.tsx, portfolio/event/invoice filter buttons
// Footer links: client/src/components/Footer.tsx - text-grey hover:text-ink
// Tailwind config custom colors: ink, paper, grey, grey-light, grey-faint
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
        brass: {
          DEFAULT: "#B9824A",
          hover: "#9C6A3B",
          muted: "#F4E7D8",
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
