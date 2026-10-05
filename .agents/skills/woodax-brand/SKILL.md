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

## 10. Navigation bar — floating collapsing pill (both brands)

Structure: a floating pill bar inset from the page edges, sitting ABOVE an inset rounded hero card (never overlaying the hero text). It collapses into a compact pill on scroll.

Expanded state (top of page, desktop ≥ 768px):
- Container: max-width 1200px, centered, top offset 16px, height 64px, padding 8px 8px 8px 20px, fully rounded (9999px).
  - design: background woodax-cream (on sand page) or white-ish #FBFAF7, 1px border woodax-sand.
  - cnc: background cnc-surface, 1px border cnc-line.
- Left: full horizontal logo (woodax-logo.svg / cnc-logo.svg), height 28px, links to "/".
- Center: 3 anchor links max (design: Proyectos · Proceso · Contacto / cnc: Servicio · Materiales · Contacto), Outfit 400 15px. Active-section indicator = a soft pill behind the current link (design: sand / cnc: cnc-line) that slides between links (motion layoutId, 240ms --ease-out), driven by IntersectionObserver scrollspy.
- Right: primary CTA pill (shadcn Button brand variant): design "Cuéntanos tu proyecto" (charcoal/cream), cnc "Cotizar" (white/cnc-bg). NEVER "Login".
- Language switch ES/EN: small text toggle just left of the CTA.

Collapsed state (after 80px of scroll, desktop) — matches the approved reference video:
- The pill shrinks horizontally toward the center to fit-content width. Contents stay in the same order: logo (full logo cross-fades to the mark, 24px) · the 3 anchor links (still visible, active indicator keeps working) · CTA.
- The CTA morphs from the text pill into a 40px circular icon button (arrow-up-right) in the same brand color; the label fades out before the shape shrinks. It keeps aria-label with the full CTA text and shows it as a tooltip on hover/focus.
- The language switch fades out in the collapsed state (it remains in the expanded state and in the mobile Sheet).
- Width/position animate with motion layout animation, 280ms --ease-out; reverses when scrolling back above 80px. Must be interruptible (direction change mid-animation reverses smoothly). Height goes 64 → 52px. Text never scales (no squashed glyphs): only the container resizes, inner elements cross-fade.
- Solid background in both states. No backdrop blur, no glass, no drop shadow beyond a 1px border.
- Under prefers-reduced-motion: no width animation; swap states with a 120ms opacity crossfade.

Mobile (< 768px):
- Pill always compact: mark (24px) left, hamburger icon button (44×44) right; height 52px, top offset 12px, side inset 12px. No collapse animation.
- Hamburger opens a shadcn Sheet (full height, from the right) with the 3 anchors, sibling-brand link, Instagram and ES/EN.
- The CTA lives in the MobileCtaBar (section 6), not in the pill.

Hero card under the nav:
- Inset from page edges: 16px mobile, 24px desktop. The floating pill sits inside the top padding of the page; the hero card starts 88px from the top (desktop) / 76px (mobile).
- Radius: design 28px (radius-media) · cnc 6px with a 1px cnc-line border.
- Height: calc(100svh - 112px), min 560px. Headline centered, max 18ch; subhead max 56ch; single CTA below.

Accessibility: <nav aria-label>, links are real anchors to section ids, aria-current on the active link, visible focus ring (section 5), collapse never removes the CTA from the tab order.

## 11. Layout patterns (from the approved reference; adapted, not copied)

No italics anywhere (Outfit has no true italic; never fake it). Emphasis = weight and tone only.

- Section label: small rounded dot (6px, currentColor) + eyebrow text (section 4 eyebrow style), top-left of each section.
- Numbered row: 3 columns on desktop / stacked on mobile. Number in Outfit 300 at h3 size in muted tone ("01." "02." "03."), title below in body 500, one line of body 300. Used for "Así trabajamos" (design) and "Del archivo a la pieza" (cnc).
- Statement paragraph: large text (h2 scale, weight 300) max 24ch per line on desktop; 2–3 emphasized phrases in weight 500 + full foreground color, the rest in muted tone. Emphasis is marked in messages with <b>…</b> and rendered via next-intl rich text. Left column on desktop may hold one small rounded photo (radius-card) — only a real photo, otherwise nothing.
- Icon chip in headings: the brand mark inside a rounded square chip, inline with h1/h2 text, height 0.9em, vertically centered. Design: charcoal chip + cream mark. CNC: cnc-surface chip with cnc-line border + white mark. Max one chip per heading, aria-hidden, never in body text. Requires the mark SVG; if missing, render nothing.
- Project cards: tall cards (aspect 3/4), radius-card, real photo full-bleed, tag pill top-left (eyebrow style, sand bg on design / cnc-surface on cnc), title bottom-left over a subtle bottom gradient (charcoal 0→45% / cnc-bg 0→60%). Mobile: horizontal scroll-snap with 16px peek of the next card. Desktop: 3–4 per row.
- Footer: see section 13 (ultra-minimal). The dark closing block with giant wordmark is NOT used.

## 13. Footer — ultra-minimal (both brands)

- One row on desktop (≥ 768px), stacked and centered on mobile. Top border 1px (design sand / cnc-line). Padding 32px vertical. Page background (no dark block, no giant wordmark).
- Left: © {year} Woodax Design (cnc: © {year} CNC by Woodax Design) · small sibling-brand link.
- Center: legal links in 14px muted tone: Aviso de privacidad · Términos y condiciones · Preferencias de cookies (opens the consent preferences dialog).
- Right: three 20px icon links, 44×44 hit area, aria-labels: Facebook, Instagram, Mail (mailto: hello@woodax.design / cnc@woodax.design). Brand icons as inline SVG components from Simple Icons (CC0) in src/components/icons/ — lucide's brand icons are deprecated; Mail uses lucide. Facebook/Instagram render only if their URL exists in site-config.
- Last line, 12px muted: "Desarrollado por Noctra Studio" (link to https://noctra.studio). Contractual — do not remove.
- No newsletter, no address, no phone in the footer.

## 14. Cookie consent

- Port the existing consent component from the Noctra Studio site repo (same UX and copy structure); adapt styles to these tokens and shadcn components, and texts to messages (es/en). Do not invent a different UX.
- Categories: Necessary (always on: locale, consent, preview-site cookies) · Analytics · Marketing. Non-necessary scripts load ONLY after explicit opt-in for their category. Today there are no analytics or marketing scripts; the categories exist so they can be added gated later.
- Storage: first-party cookie `woodax_consent` = JSON {v:1, necessary:true, analytics:boolean, marketing:boolean, ts}, path=/, SameSite=Lax, Secure, max-age 400 days (browser maximum; Chrome caps cookie lifetime at 400 days). Shared across woodax.design and cnc.woodax.design via domain=.woodax.design in production (host-only on previews/localhost). Mirror to localStorage as fallback (try/catch). Banner never shows again while the cookie exists; bump `v` to re-ask when categories change.
- The banner must not cause layout shift, must not block the page (no modal on load), must be keyboard accessible, and must sit above the MobileCtaBar on mobile without covering the form submit button.
- Footer "Preferencias de cookies" reopens the preferences dialog.

## 15. Language switch (no reload, no scroll jump)

- Switching ES/EN must be a client-side transition: next-intl navigation `router.replace(pathname, { locale, scroll: false })` from src/i18n/navigation.ts. Never window.location, never a plain <a href> to the other locale, never router.refresh().
- Preserve: scroll position (scroll: false; if Next still resets it, store window.scrollY before and restore it in a layout effect after the locale changes), URL hash, query params (utm_*, ?site=), form values (already in sessionStorage), open/closed Sheet state closes gracefully.
- The intro animation must NOT replay on a locale switch (session flag), and HeroMedia/video must not remount if avoidable.
- Update <html lang> and document.title without a full reload. Works on both hosts (woodax.design and cnc.woodax.design with the proxy rewrite) and on Vercel previews with ?site=cnc.
- Acceptance test: scroll to the middle of the page, switch language → text changes in place, no white flash, no network document request (only RSC fetch), scrollY unchanged ±1px.

## 16. Assets & config

- public/brand/woodax-logo.svg, public/brand/cnc-logo.svg (white), woodax-mark.svg, cnc-mark.svg, woodax-wordmark.svg, cnc-wordmark.svg (optional, for the footer).
- public/images/design/*, public/images/cnc/* — only real client photos.
- src/content/site-config.ts holds: instagramUrl, instagramHandle, facebookUrl, cnc specs (all optional). Missing values = hidden UI.
- All visible strings come from src/messages/{es,en}.json, populated from docs/brand/copy-deck.md.
