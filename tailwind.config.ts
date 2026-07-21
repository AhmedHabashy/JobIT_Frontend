import type { Config } from "tailwindcss";

/**
 * "Nile & Limestone" palette — a subject-grounded refresh of the original
 * Material-3 token set. Warm limestone surfaces, a deep Nile-lapis primary, and
 * an Egyptian-gold accent (see specs/001-jobit-web-app/design-refresh.md). Token
 * NAMES are preserved so components keep their semantic classes; only the values
 * changed. Light theme only.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces — cool light
        surface: "#f5f7fc",
        background: "#f5f7fc",
        "surface-bright": "#ffffff",
        "surface-dim": "#e7ecf5",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fbfcfe",
        "surface-container": "#eef2fa",
        "surface-container-high": "#e7ecf5",
        "surface-container-highest": "#dfe6f1",
        "surface-variant": "#e9eef7",
        "surface-tint": "#1f6bff",

        // Text / ink
        "on-surface": "#111726",
        "on-background": "#111726",
        "on-surface-variant": "#5f6b7d",

        // Lines
        outline: "#9aa6ba",
        "outline-variant": "#d9e0ec",

        // Primary — electric blue
        primary: "#1f6bff",
        "on-primary": "#ffffff",
        "primary-hover": "#1550cf",
        "primary-container": "#dbe7ff",
        "on-primary-container": "#0b2f7a",
        "primary-fixed": "#dbe7ff",
        "primary-fixed-dim": "#9cc0ff",
        "on-primary-fixed": "#06225e",
        "on-primary-fixed-variant": "#1550cf",
        "inverse-primary": "#9cc0ff",

        // Accent — cyan
        accent: "#0bc5d6",
        "on-accent": "#04333a",
        "accent-strong": "#068a97",
        tertiary: "#0bc5d6",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#c9f2f6",
        "on-tertiary-container": "#05343b",
        "tertiary-fixed": "#c9f2f6",
        "tertiary-fixed-dim": "#7fdfe8",
        "on-tertiary-fixed": "#04333a",
        "on-tertiary-fixed-variant": "#068a97",

        // Secondary — positive green + blue-tinted containers/chips
        secondary: "#0e9f6e",
        "on-secondary": "#ffffff",
        "secondary-container": "#dbe7ff",
        "on-secondary-container": "#0b2f7a",
        "secondary-fixed": "#dbe7ff",
        "secondary-fixed-dim": "#9cc0ff",
        "on-secondary-fixed": "#06225e",
        "on-secondary-fixed-variant": "#1550cf",

        // Error
        error: "#dc2626",
        "on-error": "#ffffff",
        "error-container": "#fde8e8",
        "on-error-container": "#991b1b",

        // Inverse
        "inverse-surface": "#1b2233",
        "inverse-on-surface": "#eef2fa",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.875rem",
        full: "9999px",
      },
      spacing: {
        md: "24px",
        base: "8px",
        sm: "12px",
        lg: "48px",
        gutter: "20px",
        xs: "4px",
        "margin-desktop": "auto",
        xl: "80px",
        "margin-mobile": "16px",
        "max-width-content": "1120px",
      },
      maxWidth: {
        "max-width-content": "1120px",
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        // Kinetic identity — Geist everywhere (bold weights carry the display).
        display: ["Geist", "system-ui", "sans-serif"],
        "display-lg": ["Geist", "system-ui", "sans-serif"],
        "display-lg-mobile": ["Geist", "system-ui", "sans-serif"],
        "headline-md": ["Geist", "system-ui", "sans-serif"],
        "body-md": ["Geist", "system-ui", "sans-serif"],
        "label-caps": ["Geist", "system-ui", "sans-serif"],
        "body-sm": ["Geist", "system-ui", "sans-serif"],
        "title-sm": ["Geist", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "title-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
};

export default config;
