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
