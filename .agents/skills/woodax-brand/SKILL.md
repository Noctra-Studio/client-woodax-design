---
name: woodax-brand
description: Brand, visual, motion and copy rules for the Woodax Design and CNC by Woodax Design coming-soon sites. Use for ANY UI, styling, animation, copy or asset work in this repo. These rules override generic design skills when they conflict.
---

# Woodax Design + CNC by Woodax Design — Brand rules

## Precedence
- woodax-brand wins on brand: colors, typography, copy, motion tokens (easings, durations, intro limits), component library (shadcn/ui) and forbidden patterns.
- emil-design-eng / animate / review-animations guide HOW to animate (properties, origins, interruptibility, what not to animate) within the woodax-brand tokens. If one suggests an easing or duration outside our tokens, use the closest woodax-brand token.
- mobile-native guides touch, viewport, safe-area and hover fixes; it complements section 6 of this file.
- frontend-design, web-design-guidelines and vercel-react-best-practices apply where this file is silent.
- break-ui is for QA only (Phase 4 and before showing the client), not for adding features.
- The UI library decision (shadcn/ui) is final.

Two sibling brands, one repo, one deploy.
- Woodax Design → woodax.design. Bespoke carpentry for homes AND businesses. Strong Instagram presence. Light, natural, warm.
- CNC by Woodax Design → cnc.woodax.design. New B2B venture: rents CNC router time to workshops and produces bulk parts for companies and sign makers. Goal: get the machine booked. Dark, technical, precise.

If a request conflicts with this file, stop and ask. Never "fill gaps" with invented content.

## 1. Hard rules (anti-hallucination)

NEVER invent or add:
- Numbers or stats (years, project counts, clients served, delivery times, prices, machine specs).
- Testimonials, reviews, client names or logos, awards, certifications.
- Phone numbers, addresses, opening hours, social handles other than the ones in config.
- Stock photos, AI-generated images, illustrations of people, emojis.
- Copy not present in docs/brand/copy-deck.md. If a string is missing, add a `TODO(copy)` key and tell me; don't write your own.
- Colors, fonts, radii, shadows or easings outside the tokens below.

NEVER use: glassmorphism, neon/glow, gradients as decoration (only the subtle overlay on hero media), auto-advancing carousels, parallax on mobile, scroll-jacking, cursor followers, confetti, pop-ups/modals on load, cookie-style banners, fake loading bars.

Machine specs, prices and delivery times render only if the value exists in config; otherwise the row/section is hidden. Never show "TBD" in the UI.

## 2. Woodax Design — "Naturaleza moderna"

Feeling: a fresh, natural, modern studio. Confident, airy, warm. Premium through restraint, not ornament.

Color tokens (exact):
| Token | Hex | Use |
|---|---|---|
| woodax-green | #83AF6E | Full-bleed section blocks, large shapes, logo motif, selected states. NEVER as text color, NEVER as button fill with light text. |
| woodax-green-soft | #A2C392 | Hover/tint on green blocks, dividers on green. |
| woodax-charcoal | #3F3738 | All body text, headings, primary buttons (cream text), icons. |
| woodax-cream | #F4F1EC | Page background, text on charcoal. |
| woodax-sand | #E7E0D5 | Cards and inputs on cream, secondary surfaces. |

Contrast facts (do not break): charcoal on green 4.59:1 (OK, use ≥16px); white on green 2.52:1 (FORBIDDEN); green on cream 2.24:1 (FORBIDDEN for text); charcoal on cream 10.27:1.

Text on green blocks is ALWAYS charcoal.

Layout language:
- Alternate cream sections and full-bleed green blocks. Max 2 green blocks per page.
- Radius echoes the logo's rounded square: --radius-card 24px, --radius-media 28px, --radius-control 14px, buttons fully rounded (9999px).
- Decorative motif: the crossing arcs of the logo mark, drawn as 1.5px cream lines on green blocks (inline SVG, opacity .35). Use at most twice.
- Generous whitespace: section padding 96–160px desktop, 64–96px mobile. Content max-width 1200px; text max 62ch.
- Photos: full-bleed or large rounded media, never small thumbnails in a dense grid.

## 3. CNC by Woodax Design — "Plano técnico oscuro"

Feeling: an engineering drawing. Sober, exact, trustworthy for business buyers. Not gamer, not sci-fi.

Color tokens (exact) — NO accent color:
| Token | Hex | Use |
|---|---|---|
| cnc-bg | #16171A | Page background (never pure black). |
| cnc-surface | #1F2125 | Cards, inputs, spec tables. |
| cnc-line | #2E3136 | Grid lines, borders, dividers (1px). |
| cnc-muted | #9A9FA6 | Secondary text, labels, coordinates. |
| cnc-text | #ECEDEE | Primary text, logo, icons. |
| cnc-white | #FFFFFF | Primary button fill (text cnc-bg). |

Layout language:
- Background: technical grid, 1px cnc-line every 24px, masked to fade toward edges. Corner registration marks (+) at section corners.
- Radius: small and precise. --radius-card 6px, --radius-control 4px, buttons 4px.
- Data in JetBrains Mono uppercase with letter-spacing .08em: labels, coordinates, spec values, step numbers ("01 / 03").
- Specs shown as tables/rows, not marketing cards.
- Logo: always the white SVG at public/brand/cnc-logo.svg. Never recreate it in code.

## 4. Typography (both brands)

- Outfit (next/font/google) 300/400/500/600 — everything. Closest match to the logotype.
- JetBrains Mono 400/500 — CNC data only. Never on Woodax.
- Scale (clamp, mobile→desktop): display 40→80px / weight 400 / tracking -0.02em / leading 1.02; h2 30→48px / 400; h3 20→24px / 500; body 17→18px / 300–400 / leading 1.6; small 14px.
- Eyebrows: 12–13px, uppercase, tracking .18em, weight 500 (mirrors the "DESIGN" lockup).

## 5. Motion system

Library: `motion` (motion.dev) for step transitions, layout/height animation and the intro. The mobile bottom sheet is the shadcn Drawer (vaul). Everything else in CSS. No GSAP.

Tokens:
- --ease-out: cubic-bezier(0.22, 1, 0.36, 1)
- --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
- Durations: press 120ms · UI 240ms · reveal 700ms · intro ≤ 1800ms total.
- Stagger between siblings: 70ms.

Page intro (both brands, once per session via sessionStorage, skippable on tap, disabled under prefers-reduced-motion):
- Woodax: hero media unmasks with clip-path inset(12% round 28px → 0 round 28px) + scale 1.06→1 (900ms); logo fades in; headline lines rise 24px + fade, staggered.
- CNC: grid lines draw from the top-left corner (600ms); a thin toolpath line traces the outline of the logo mark (stroke-dashoffset, 900ms) while mono coordinates count from X 0.000 Y 0.000; headline appears.
- The real content is server-rendered underneath. The intro never delays LCP or blocks input.

Micro-interactions:
- Buttons: :active scale(.97) 120ms; hover (pointer: fine only) background shift + arrow icon nudges 4px.
- Option cards (form step 1): selected state animates border + a check that draws in (stroke) 240ms; haptic-like scale .98 → 1.
- Inputs: label floats, focus ring 2px (Woodax charcoal / CNC white) with 2px offset.
- Submit: button morphs to spinner, then success check draws; success panel slides up.
- Section reveals: fade + 16px rise on first enter (IntersectionObserver, once). No reveal on elements above the fold after the intro.
- Woodax only: logo-arc motif lines draw slowly (1.2s) when their block enters.
- CNC only: spec rows reveal left→right like a plotter pass.

## 6. Native feel on mobile (required)

- Heights with svh/dvh, never 100vh. Respect env(safe-area-inset-*).
- -webkit-tap-highlight-color: transparent; touch-action: manipulation; tap targets ≥ 44px.
- Instant feedback on touch (:active) — no hover-dependent UI.
- Sticky bottom CTA bar on mobile ("Cuéntanos tu proyecto" / "Cotizar mi proyecto") that hides when the form is in view.
- On mobile the form opens in the shadcn Drawer (bottom sheet), drag-to-dismiss, focus trapped, body scroll locked, keyboard-safe (inputs scroll into view above the keyboard). Desktop: inline section.
- Inputs: correct inputmode/autocomplete (name, email, tel), font-size ≥ 16px (no iOS zoom).
- overscroll-behavior: none on the sheet; smooth scroll for anchor links, disabled under reduced motion.

## 7. Hero media (client video pending)

Component HeroMedia({ poster, videoSrc? }):
- If videoSrc is absent → render poster with next/image priority (this is the current state).
- If present → <video autoplay muted loop playsinline preload="metadata" poster>; sources WebM (VP9/AV1) + MP4 (H.264); 8–12s loop, no audio track; mobile ≤ 1.5 MB (720p), desktop ≤ 3 MB (1080p).
- Show poster only (no video) under prefers-reduced-motion or Save-Data. Pause when off-screen.
- Overlay for legibility: Woodax charcoal 0→35% bottom gradient; CNC bg 40% flat + grid on top.

## 8. Voice

Woodax (aspirational + craft): warm, confident, concrete. Speaks to homeowners and businesses. Short sentences. Talk about how the space feels and how precisely it's made.
CNC (precision + B2B collaboration): direct, technical, efficient. Speaks to workshops, companies and sign makers. Lead with capability and process, not adjectives.
Both: Spanish (neutral LATAM) is the default; English is adapted, not literal. No hype words ("revolucionario", "el mejor", "líderes"). No exclamation marks.

## 9. Components: shadcn/ui (required)

- All interactive primitives come from shadcn/ui, installed with the CLI into src/components/ui/ (we own and edit that code): button, input, label, textarea, radio-group, checkbox, drawer, card, separator.
- Never hand-roll a primitive that shadcn provides, and never install another UI kit (MUI, Chakra, Mantine, daisyUI, etc.).
- Branding happens in two places only:
  1. shadcn CSS variables, set per brand under [data-site="design"] and [data-site="cnc"] in globals.css (mapping below).
  2. Brand variants added with cva inside src/components/ui/*.tsx (e.g. Button variant "design" | "cnc"). Don't override shadcn styles with ad-hoc classNames scattered across pages.
- Option cards for the form = shadcn RadioGroup items restyled as cards (still a real radio group, keyboard accessible).
- Icons: lucide-react only (shadcn default), stroke 1.5.

Variable mapping:
| shadcn var | design | cnc |
|---|---|---|
| --background | woodax-cream | cnc-bg |
| --foreground | woodax-charcoal | cnc-text |
| --card / --popover | woodax-sand | cnc-surface |
| --card-foreground | woodax-charcoal | cnc-text |
| --primary | woodax-charcoal | cnc-white |
| --primary-foreground | woodax-cream | cnc-bg |
| --secondary | woodax-sand | cnc-surface |
| --secondary-foreground | woodax-charcoal | cnc-text |
| --muted | woodax-sand | cnc-surface |
| --muted-foreground | woodax-charcoal at 75% (check AA) | cnc-muted |
| --accent | woodax-green-soft | cnc-surface |
| --accent-foreground | woodax-charcoal | cnc-text |
| --border / --input | woodax-sand darkened ~8% | cnc-line |
| --ring | woodax-charcoal | cnc-white |
| --destructive | #B42318 | #F97066 |
| --radius | 14px | 4px |

## 10. Assets & config

- public/brand/woodax-logo.svg, public/brand/cnc-logo.svg (white).
- public/images/design/*, public/images/cnc/* — only real client photos.
- src/content/site-config.ts holds: instagramUrl, instagramHandle, cnc specs (all optional). Missing values = hidden UI.
- All visible strings come from src/messages/{es,en}.json, populated from docs/brand/copy-deck.md.
