# Design Refresh — "Nile & Limestone" (colour + UX + mobile)

Lightweight design plan standing in for a full Spec Kit spec (this is a visual/UX
refresh, not new product behaviour). Light theme only.

## Why
The old palette was a default Material-3 export: cold grey surfaces, a generic blue,
and a harsh acid-cyan (`#62fae3`) that clashed. Mobile was broken — the sidebar was
`hidden md:flex`, leaving phones with no access to history, credits, or sign-out.

## Colour tokens (grounded in the subject: Egyptian labour market)
| Role | Hex | Note |
|---|---|---|
| surface / background | `#F5F1E8` | warm limestone (was cold `#f9f9f7`) |
| card (container-lowest) | `#FFFFFF` |  |
| container-low | `#FBF8F1` | warm off-white |
| text (on-surface) | `#1E2A32` | deep slate ink |
| on-surface-variant | `#55606A` | muted slate |
| outline-variant | `#DED6C7` | warm hairline |
| **primary** | `#123A5A` | Nile lapis — brand, primary buttons |
| **accent** (tertiary) | `#C6892B` | Egyptian gold — hero CTA, highlights (dark ink text) |
| secondary (positive) | `#2E7D5B` | palm green |
| secondary-container | `#F3E4C6` | warm pale-gold chips (replaces acid cyan) |

Gold has poor contrast with white text, so gold surfaces use dark ink (`#26303A`) and
gold-as-text uses the darker `#8A5E15`.

## Type
- **Fraunces** (warm old-style serif) for the wordmark, display headings, and section
  headlines — used with restraint. This is the signature departure from the templated
  all-sans look.
- **Geist** (sans) stays for body, UI, labels, and data.

## Layout / UX
- Structure unchanged. Mobile fix: off-canvas sidebar **drawer** + hamburger in the
  workspace header, overlay scrim, closes on navigation. Delete/affordances made
  tap-visible on touch (no hover dependency).
- Quality floor: visible keyboard focus ring, `prefers-reduced-motion` respected,
  ≥44px tap targets on key controls.

## Signature
The warm limestone canvas + serif Nile-lapis wordmark + a single gold hero CTA, with
the hero demand-trend bars restyled in a lapis→gold gradient.
