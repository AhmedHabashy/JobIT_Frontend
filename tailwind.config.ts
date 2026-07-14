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
        // Surfaces — warm limestone family
        surface: "#f5f1e8",
        background: "#f5f1e8",
        "surface-bright": "#ffffff",
        "surface-dim": "#e5decf",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fbf8f1",
        "surface-container": "#f0eadd",
        "surface-container-high": "#e9e1d2",
        "surface-container-highest": "#e1d8c7",
        "surface-variant": "#eae3d5",
        "surface-tint": "#123a5a",

        // Text / ink
        "on-surface": "#1e2a32",
        "on-background": "#1e2a32",
        "on-surface-variant": "#55606a",

        // Lines
        outline: "#94897a",
        "outline-variant": "#ded6c7",

        // Primary — Nile lapis
        primary: "#123a5a",
        "on-primary": "#ffffff",
        "primary-hover": "#0e2e48",
        "primary-container": "#1e5687",
        "on-primary-container": "#eaf2f9",
        "primary-fixed": "#cfe3f2",
        "primary-fixed-dim": "#8fbfe0",
        "on-primary-fixed": "#001e30",
        "on-primary-fixed-variant": "#0e2e48",
        "inverse-primary": "#8fbfe0",

        // Accent — Egyptian gold (dark ink on gold; darker gold for gold-as-text)
        accent: "#c6892b",
        "on-accent": "#26303a",
        "accent-strong": "#8a5e15",
        tertiary: "#b07a1e",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#f3e4c6",
        "on-tertiary-container": "#5e3f12",
        "tertiary-fixed": "#f3e4c6",
        "tertiary-fixed-dim": "#e6c98a",
        "on-tertiary-fixed": "#3a2708",
        "on-tertiary-fixed-variant": "#5e3f12",

        // Secondary — palm green (positive) + warm pale-gold containers/chips
        secondary: "#2e7d5b",
        "on-secondary": "#ffffff",
        "secondary-container": "#f3e4c6",
        "on-secondary-container": "#6e4a15",
        "secondary-fixed": "#f3e4c6",
        "secondary-fixed-dim": "#e6c98a",
        "on-secondary-fixed": "#3a2708",
        "on-secondary-fixed-variant": "#5e3f12",

        // Error
        error: "#b3261e",
        "on-error": "#ffffff",
        "error-container": "#f9dedc",
        "on-error-container": "#8c1d18",

        // Inverse
        "inverse-surface": "#2b333a",
        "inverse-on-surface": "#f3efe6",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
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
        // Display / headline / wordmark → Fraunces (warm old-style serif).
        display: ["Fraunces", "Georgia", "serif"],
        "display-lg": ["Fraunces", "Georgia", "serif"],
        "display-lg-mobile": ["Fraunces", "Georgia", "serif"],
        "headline-md": ["Fraunces", "Georgia", "serif"],
        // Body / UI / data → Geist.
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
