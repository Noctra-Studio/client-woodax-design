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

NEVER use: glassmorphism (single exception: the scrolled navbar, section 10), neon/glow, gradients as decoration (only the subtle overlay on hero media), auto-advancing carousels, parallax on mobile, scroll-jacking, cursor followers, confetti, pop-ups/modals on load, banners other than the cookie consent (section 14), fake loading bars.

Machine specs, prices and delivery times render only if the value exists in config; otherwise the row/section is hidden. Never show "TBD" in the UI.

## 2. Woodax Design — "Naturaleza moderna"

Feeling: a fresh, natural, modern studio. Confident, airy, warm. Premium through restraint, not ornament.

Color tokens — official, from the Woodax brand guideline (woodax_arculat.pdf). Note: the PDF swaps the labels of the dark and cream swatches; the correct values are below.
| Token | Hex | Source | Use |
|---|---|---|---|
| woodax-green | #8BAF64 | official | Full-bleed blocks, large shapes, selected states. NEVER as text on light backgrounds, NEVER as a button fill with light text. |
| woodax-lime | #A7CB5F | official | Small accents: active indicator, focus ring on charcoal, hover tint on green blocks. Not a block color. |
| woodax-charcoal | #483D3C | official | Body text, headings, primary buttons (cream text), icons, dark surfaces. |
| woodax-cream | #E5E1D1 | official | Cards, inputs, secondary surfaces, text on charcoal. |
| woodax-paper | #F3F1EA | derived (tint of cream) | Page background, so cream cards still read as surfaces. |
| woodax-stripe | #7A7576 | from guideline cover | Wave-stripe motif only. |

Contrast facts (official colors — do not break):
- charcoal on paper 9.28 · charcoal on cream 7.98 → any size.
- charcoal on green 4.19 → ONLY large text (≥ 24px regular or ≥ 19px bold). Body copy on a green block goes inside a cream card.
- cream on charcoal 7.98 · lime on charcoal 5.65 · green on charcoal 4.19 (large text only).
- white on green 2.50 and green on cream 1.90 → FORBIDDEN for text.

Layout language:
- Alternate paper sections and full-bleed green blocks. Max 2 green blocks per page.
- Radius echoes the logo's rounded square: --radius-card 24px, --radius-media 28px, --radius-control 14px, buttons fully rounded (9999px).
- Decorative motif (official): the thick flowing wave stripes from the guideline cover — 2–3 parallel S-curves, stroke ~ 2.5% of the viewport width, rounded caps, woodax-stripe at 18–25% opacity on paper or cream at 30% on green. Bleed off the section edges, never behind body text, max 2 appearances per page, aria-hidden inline SVG. They replace the logo-arc motif (removed).
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
- Logo: always the white SVG at public/brand/cnc-woodax-logo.svg. Never recreate it in code.

## 4. Typography (from the brand guideline)

Woodax Design
- Headings (display, h1, h2, h3, statement paragraph): Playfair Display 400 and 700 (official brand font), next/font/google, variable `--font-serif`. Real italics exist but are NOT used (decision: no italics).
- Body, UI, nav, buttons, forms, eyebrows, numbers: Quicksand 400/500/600 (official logo font), variable `--font-sans`. Body uses 500 (Quicksand 400 is too light at small sizes); never below 15px.
- Scale (clamp, mobile→desktop): display 40→76px Playfair 400 / tracking -0.01em / leading 1.05; h2 30→48px Playfair 400; h3 20→24px Playfair 700; statement 26→40px Playfair 400 with <b> in 700; body 17→18px Quicksand 500 / leading 1.65; small 14px Quicksand 500.
- Eyebrows: Quicksand 600, 12–13px, uppercase, tracking .18em (mirrors the "DESIGN" lockup).
- Numbered row numbers: Playfair 400 at h3 size in muted charcoal.

CNC by Woodax Design
- Quicksand 400/500/600 for everything (headings 500–600, body 500). NO Playfair on CNC: a classic serif fights the technical drawing language, and the approved CNC look stays.
- JetBrains Mono 400/500 for data only (labels, coordinates, specs, step numbers). Never on Woodax.
- Same size scale as Woodax, with Quicksand headings at weight 500 and tracking -0.01em.

Logo lettering is Quicksand: any derived brand asset (e.g. "CNC" in cnc-woodax-logo.svg) must use Quicksand converted to outlines — never typeset the brand name live in the UI to imitate the logo.

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
- Woodax only: wave-stripe motif draws in slowly (stroke-dashoffset, 1.2s, --ease-out) the first time its section enters; static under reduced motion.
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
| --background | woodax-paper | cnc-bg |
| --foreground | woodax-charcoal | cnc-text |
| --card / --popover | woodax-cream | cnc-surface |
| --card-foreground | woodax-charcoal | cnc-text |
| --primary | woodax-charcoal | cnc-white |
| --primary-foreground | woodax-cream | cnc-bg |
| --secondary | woodax-cream | cnc-surface |
| --secondary-foreground | woodax-charcoal | cnc-text |
| --muted | woodax-cream | cnc-surface |
| --muted-foreground | woodax-charcoal at 75% (check AA) | cnc-muted |
| --accent | woodax-lime | cnc-surface |
| --accent-foreground | woodax-charcoal | cnc-text |
| --border / --input | woodax-cream darkened ~10% (#D6D1BE) | cnc-line |
| --ring | woodax-charcoal | cnc-white |
| --destructive | #B42318 | #F97066 |
| --radius | 14px | 4px |

## 10. Navigation bar — transparent → glass pill on scroll (both brands)

States
1. Top (scrollY < 24px): NO background, NO border, NO shadow. Full content width (max 1200px, side padding 24px), height 80px, top offset 12px. Logo (full) left · anchors center · ES/EN + CTA pill right. Sits directly over the page/hero.
2. Scrolled (after crossing 64px going down): becomes a floating glass pill, centered, fit-content width, height 56px, top offset 12px, fully rounded. Content: mark (28px; logo folds into it, see recipe) · anchors · CTA as a 40px circle with arrow-up-right (aria-label = full CTA text, tooltip on hover/focus). ES/EN hidden in this state.
3. Back to Top state when scrolling up past 24px (hysteresis 64↓ / 24↑ to avoid flicker at the threshold).

Glass (the ONLY place glass is allowed in this project)
- design: background rgb(243 241 234 / 0.72); backdrop-filter: blur(16px) saturate(140%); border 1px rgb(214 209 190 / 0.9); box-shadow 0 8px 24px -12px rgb(72 61 60 / 0.18).
- cnc: background rgb(22 23 26 / 0.62); backdrop-filter: blur(16px) saturate(120%); border 1px rgb(46 49 54 / 0.9); box-shadow 0 8px 24px -12px rgb(0 0 0 / 0.5).
- Fallbacks: @supports not (backdrop-filter: blur(1px)) and prefers-reduced-transparency → solid woodax-paper / cnc-surface. Text inside must keep AA over the worst-case content behind (test over the CNC hero video and the green blocks).

Animation recipe (no distortion — this is mandatory)
- Do NOT use motion `layout` / transform-scale on the container or on anything containing text. That is what stretches the labels and turns the pill into an ellipse.
- Container: animate real `width` (motion `animate={{ width }}` with values measured by ResizeObserver for both states) + padding + height. 320ms, --ease-out. overflow: hidden, border-radius constant 9999px.
- Background, border and blur: CSS transition 200ms on background-color, border-color, box-shadow, backdrop-filter. They start at the same time as the width.
- Text never scales. Labels that leave (ES/EN, CTA text) fade out in 120ms BEFORE the width shrinks; labels that enter fade in 160ms AFTER the width grows. The CTA label collapses with the grid-template-columns 0fr↔1fr technique inside the button; the button height goes 40px both states, so the circle is just the label at 0fr.
- Logo ↔ mark: the mark NEVER moves or scales. The logo is rendered as two SVGs side by side: {brand}-icon.svg + {brand}-wordmark.svg (brand = woodax-design | cnc-woodax) (the text part of the lockup). On collapse the wordmark retracts: its wrapper goes grid-template-columns 1fr → 0fr with opacity 1 → 0 (120ms, before the container width shrinks); on expand it reverses after the width grows. The mark stays pinned left, so it reads as "the logo folds into its symbol". If the split files don't exist, fall back to a cross-fade between the full logo and the mark.
- Logo size: expanded state lockup height 44px desktop (the two-line lockup's sub-line must stay legible — never below 40px), collapsed mark 28px. Top-state nav height 80px to fit it. Mobile always mark only (28px).
- Active-section pill behind anchors: the only element that may use motion layoutId, and it contains no text (it is a background shape).
- Scroll handling: motion useScroll + useMotionValueEvent (rAF-batched); no setState on every scroll event beyond the state flip.
- Interruptible: reversing direction mid-animation retargets smoothly from the current values.
- prefers-reduced-motion: no width animation; the two states swap with a 120ms opacity crossfade.

Mobile (< 768px)
- Top state: transparent, mark + hamburger (44×44). Scrolled: same content in the glass pill (full width minus 12px insets, height 52px). No width animation, only the glass fade.
- Hamburger opens a shadcn Sheet with anchors, sibling-brand link, Instagram, Facebook and ES/EN. CTA lives in the MobileCtaBar.

Language switch: ES · EN as a two-option segmented control; the active one in foreground weight 500, the other muted. aria-current on the active locale.

Hero under the nav: the nav overlays the top of the hero in the top state, so the hero/card top padding must reserve 96px for it; text in the hero must not sit under the nav.

Accessibility: <nav aria-label>, real anchors to section ids, aria-current on the active link, visible focus ring, the CTA stays in the tab order in both states.

## 11. Layout patterns (from the approved reference; adapted, not copied)

No italics anywhere (decision). Emphasis = weight and tone only.

- Section label: small rounded dot (6px, currentColor) + eyebrow text (section 4 eyebrow style), top-left of each section.
- Numbered row: 3 columns on desktop / stacked on mobile. Number in Playfair 400 (design) / JetBrains Mono (cnc) at h3 size in muted tone ("01." "02." "03."), title below in body 500, one line of body 300. Used for "Así trabajamos" (design) and "Del archivo a la pieza" (cnc).
- Statement paragraph: large text (h2 scale, weight 300) max 24ch per line on desktop; 2–3 emphasized phrases in weight 500 + full foreground color, the rest in muted tone. Emphasis is marked in messages with <b>…</b> and rendered via next-intl rich text. Left column on desktop may hold one small rounded photo (radius-card) — only a real photo, otherwise nothing.
- Icon chip in headings: the brand mark inside a rounded square chip, inline with h1/h2 text, height 0.9em, vertically centered. Design: charcoal chip + cream mark. CNC: cnc-surface chip with cnc-line border + white mark. Max one chip per heading, aria-hidden, never in body text. Requires the mark SVG; if missing, render nothing.
- Project cards: tall cards (aspect 3/4), radius-card, real photo full-bleed, tag pill top-left (eyebrow style, cream bg on design / cnc-surface on cnc), title bottom-left over a subtle bottom gradient (charcoal 0→45% / cnc-bg 0→60%). Mobile: horizontal scroll-snap with 16px peek of the next card. Desktop: 3–4 per row.
- Footer: see section 13 (ultra-minimal). The dark closing block with giant wordmark is NOT used.

## 13. Footer — ultra-minimal (both brands)

- One row on desktop (≥ 768px), stacked and centered on mobile. Top border 1px (design #D6D1BE / cnc-line). Padding 32px vertical. Page background (no dark block, no giant wordmark).
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

## 17. CNC full site (one page, production — replaces the CNC coming soon)

- CNC is no longer "coming soon". It stays a single page on cnc.woodax.design. Woodax Design remains coming soon until its own launch.
- Hero layering (bottom → top): media (video or image, object-cover) → flat overlay cnc-bg at 55% → technical grid (1px cnc-line at 24px, ALWAYS visible on top of the media, opacity .6, masked to fade at the edges) → registration marks + coordinates → content. Text must keep AA contrast over the brightest frame of the media; increase overlay, never lower text contrast.
- Hero media comes from site-config.cncHero = { type: "video" | "image" | "none", src?, poster?, alt? }. "none" = grid only (current state). Video follows section 7 (muted, loop, playsinline, poster, WebM+MP4, reduced-motion/Save-Data → poster).
- Any section whose data is missing renders nothing (specs, gallery, FAQ answers, lead times, pricing model). Never show placeholders or "TBD" in production.
- No "coming soon" / "nuevo sitio" wording anywhere on CNC. Remove noindex for the CNC host in production only.
- FAQ: shadcn Accordion, only items with an approved answer; FAQPage JSON-LD only for those same items.
- Quote form keeps the 2-step quick capture; the success state offers optional details (dimensions, quantity, deadline, file link). No file upload in this version: a URL field for Drive/WeTransfer/Dropbox links.

## 16. Assets & config

- public/brand/woodax-design-logo.svg (full lockup, official colors), woodax-design-icon.svg (mark only), cnc-woodax-logo.svg (full lockup, white), cnc-woodax-icon.svg (mark only, white). Optional: woodax-design-wordmark.svg, cnc-woodax-wordmark.svg (text block only, same artboard height as the logo).
- public/images/design/*, public/images/cnc/* — only real client photos.
- src/content/site-config.ts holds: instagramUrl, instagramHandle, facebookUrl, cnc specs (all optional). Missing values = hidden UI.
- All visible strings come from src/messages/{es,en}.json, populated from docs/brand/copy-deck.md.
