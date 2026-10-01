import type { Config } from "tailwindcss";

// Loaded by Tailwind v4 through `@config` in app/globals.css.
// Every value maps to a CSS variable from docs/02_design_system.md so themes swap in CSS.
const config: Config = {
  theme: {
    screens: {
      sm: "640px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        paper: "var(--paper)",
        card: "var(--card)",
        ink: "var(--ink)",
        soft: "var(--soft)",
        yellow: "var(--yellow)",
        pink: "var(--pink)",
        mint: "var(--mint)",
        lilac: "var(--lilac)",
        danger: "var(--danger)",
        "on-accent": "var(--on-accent)",
        "yellow-tint": "var(--yellow-tint)",
        "pink-tint": "var(--pink-tint)",
        "mint-tint": "var(--mint-tint)",
        "lilac-tint": "var(--lilac-tint)",
      },
      fontFamily: {
        heading: [
          "var(--font-heading)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        body: [
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.5" }],
        sm: ["14px", { lineHeight: "1.5" }],
        base: ["16px", { lineHeight: "1.6" }],
        lg: ["18px", { lineHeight: "1.5" }],
        xl: ["24px", { lineHeight: "1.2" }],
        "2xl": ["32px", { lineHeight: "1.05" }],
        "3xl": ["44px", { lineHeight: "1.05" }],
        "4xl": ["64px", { lineHeight: "1.05" }],
      },
      borderWidth: {
        DEFAULT: "2px",
      },
      borderRadius: {
        control: "12px",
        card: "16px",
        dialog: "24px",
        bubble: "14px",
      },
      boxShadow: {
        hard: "4px 4px 0 var(--ink)",
        "hard-sm": "2px 2px 0 var(--ink)",
      },
      maxWidth: {
        prose: "70ch",
        feed: "680px",
      },
      width: {
        rail: "72px",
        sidebar: "260px",
        panel: "420px",
      },
    },
  },
};

export default config;
