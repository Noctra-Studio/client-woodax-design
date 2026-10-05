# Woodax + CNC — Prompts para Cursor (coming soon) · v2

Reglas de uso:
- Un prompt por sesión, en orden. Rama `staging`. Al cerrar cada fase: `pnpm typecheck && pnpm lint && pnpm build`, push y revisa el preview de Vercel (`?site=cnc` para CNC).
- Pégame el link del preview o el diff de cada fase antes de pasar a la siguiente.
- Fuentes de verdad: `.agents/skills/woodax-brand/SKILL.md` (diseño, motion, reglas) y `docs/brand/copy-deck.md` (textos). Los prompts no repiten lo que ya dicen esos archivos.

## Preparación (tú, una vez)

```bash
git checkout staging
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
```
1. Copia `.agents/skills/woodax-brand/` junto a las skills que instaló `npx skills`. Copia `docs/brand/copy-deck.md` y este archivo a `docs/brand/`.
2. Logos en `public/brand/`: `woodax-design-logo.svg`, `woodax-design-icon.svg`, `cnc-woodax-logo.svg`, `cnc-woodax-icon.svg`. Fotos reales en `public/images/design/` y `public/images/cnc/`.
3. En Vercel: `CONTACT_TO_EMAIL_CNC=cnc@woodax.design` (Production + Preview).
4. Commit: `chore: add design skills and brand kit`.


### Prompt — Skills de Emil Kowalski (motion y mobile)

```
Instala solo estas skills de https://github.com/emilkowalski/skills, una por una:

npx skills@latest add emilkowalski/skills --skill emil-design-eng
npx skills@latest add emilkowalski/skills --skill animate
npx skills@latest add emilkowalski/skills --skill review-animations
npx skills@latest add emilkowalski/skills --skill mobile-native
npx skills@latest add emilkowalski/skills --skill break-ui

No instales las demás del repo (animate-expo, write-swift, ask-sonner, prototype, pick-ui-library, apple-design, improve-animations, find-animation-opportunities, animation-vocabulary): no aplican a este proyecto o empujan decisiones que ya están tomadas.

Después:
1. Verifica que las 5 quedaron en .agents/skills/ junto a woodax-brand, frontend-design, web-design-guidelines y vercel-react-best-practices. Lee el SKILL.md de cada una antes de seguir.
2. Si `--skill` no funciona con este repo, instala el paquete completo y luego elimina de .agents/skills/ las carpetas de las skills que no están en la lista.
3. Agrega al inicio de .agents/skills/woodax-brand/SKILL.md (justo después del frontmatter) esta sección:

   ## Precedence
   - woodax-brand wins on brand: colors, typography, copy, motion tokens (easings, durations, intro limits), component library (shadcn/ui) and forbidden patterns.
   - emil-design-eng / animate / review-animations guide HOW to animate (properties, origins, interruptibility, what not to animate) within the woodax-brand tokens. If one suggests an easing or duration outside our tokens, use the closest woodax-brand token.
   - mobile-native guides touch, viewport, safe-area and hover fixes; it complements section 6 of this file.
   - break-ui is for QA only (Phase 4 and before showing the client), not for adding features.
   - pick-ui-library is not installed: the UI library decision (shadcn/ui) is final.

4. Lee el código que ya existe y reporta, sin cambiar nada, cualquier conflicto entre estas skills y woodax-brand (por ejemplo, la intro de página o el uso de motion). Yo decido.
5. Commit: "chore: add motion and mobile skills from emilkowalski/skills".
```

---

## Fase 0 — Limpieza post-migración y base de marca

```
Lee AGENTS.md, la skill woodax-brand completa y la guía relevante de node_modules/next/dist/docs/ antes de escribir código (Next 16; el middleware vive en src/proxy.ts).

1. Migración a Vercel
   - Elimina netlify.toml si sigue existiendo.
   - src/lib/site.ts: allowsPreviewSiteOverride acepta hostnames que terminen en ".vercel.app" (ya no ".netlify.app"). Actualiza el JSDoc.
   - docs/DECISIONS.md: reemplaza la sección de Netlify por "Hosting en Vercel": NEXT_PUBLIC_APP_ENV por entorno en el panel (production/staging), `?site=` en previews vía cookie preview-site, DNS del dominio administrado en Vercel.
   - .cursor/rules/project.mdc: "Deploy en Vercel"; quita "motion" de la lista de "NO instalar" (se aprueba en esta fase); agrega "UI: shadcn/ui en src/components/ui; no otras librerías de componentes"; GSAP sigue fuera.

2. Variables
   - src/lib/env.ts: agrega CONTACT_TO_EMAIL_CNC (server, email requerido) con el mismo patrón que CONTACT_TO_EMAIL; agrégala a readServerInput y a .env.example (cnc@woodax.design).

3. README
   - Materiales CNC: madera (MDF, triplay, madera sólida), acrílico y aluminio delgado.
   - Technology: Next.js, React, TypeScript, Tailwind CSS v4, shadcn/ui, next-intl, motion, Resend + React Email, zod, Vercel. Sin Supabase ni Framer Motion.

4. Tokens y tipografía (src/app/globals.css, bloque @theme de Tailwind v4)
   - Implementa EXACTAMENTE los tokens de color, radios, easings y duraciones de la skill woodax-brand (secciones 2, 3 y 5). Nombres: --color-woodax-*, --color-cnc-*, --radius-*, --ease-*, --duration-*.
   - Fuentes con next/font/google: Playfair Display (400/700) como --font-serif, Quicksand (400/500/600) como --font-sans y JetBrains Mono (400/500) como --font-mono. Elimina Geist. (Ver sección 4 de la skill.)
   - Utilidades base de "native feel" (skill sección 6) en el layout: tap-highlight transparente, touch-action manipulation, svh, safe-area.
   - El layout aplica data-site="design" | "cnc" en <body> (ya resuelto por el host) para que cada marca tenga su fondo y color de texto.

5. shadcn/ui y dependencias (haz esto ANTES del punto 4 para que shadcn no pise los tokens)
   - Lee https://ui.shadcn.com/docs/installation/next y https://ui.shadcn.com/docs/tailwind-v4 antes de correr nada.
   - `pnpm dlx shadcn@latest init` → style new-york, base color neutral, CSS variables sí, alias @/components y @/lib/utils (reutiliza el cn() existente de src/lib/utils.ts, no lo dupliques), iconLibrary lucide.
   - `pnpm dlx shadcn@latest add button input label textarea radio-group checkbox drawer sheet card separator`
   - Instala `motion` (motion.dev). Ninguna otra dependencia aparte de las que traiga shadcn.
   - Verifica que components.json quede versionado y que los componentes vivan en src/components/ui/.

6. Base de componentes
   - src/components/brand/woodax-logo.tsx y cnc-logo.tsx: Server Components que renderizan los SVG de public/brand con next/image (props className, priority), alt desde messages. No recrees los logos en código.
   - src/components/site/site-nav.tsx: componente compartido (variant "design" | "cnc") según la skill sección 10, usando Sheet y Button de shadcn. Los textos del menú salen de messages (claves nav.*; si faltan en el copy deck, usa TODO(copy) y avísame).
   - src/content/site-config.ts: objeto tipado con instagramUrl?, instagramHandle?, cncSpecs?: { maxThicknessByMaterial?: Partial<Record<"wood"|"acrylic"|"aluminum", string>>, cuttingArea?: string }. Todo opcional y vacío por ahora.
   - Tematiza shadcn según la tabla "Variable mapping" de la skill (sección 9): variables bajo [data-site="design"] y [data-site="cnc"] en globals.css.
   - Edita src/components/ui/button.tsx (no crees otro Button): agrega con cva las variantes de marca design | design-outline | cnc | cnc-outline y las microinteracciones de la skill (press .97, arrow nudge solo con pointer fine). Mantén las variantes originales de shadcn.
   - Página temporal /dev/ui (solo si NEXT_PUBLIC_APP_ENV !== "production", con notFound() en producción) que muestre todos los componentes de ui/ con ambas marcas (?site=cnc) para revisarlos de un vistazo.

Sin páginas ni formulario todavía. Commits en Conventional Commits, inglés, uno por punto.
```

---

## Fase 1 — Formulario compartido, bottom sheet y Resend

```
Lee la skill woodax-brand (secciones 5 y 6) y la sección "Formulario" de ambas marcas en docs/brand/copy-deck.md. Usa la guía de Server Actions/Forms de node_modules/next/dist/docs/.

1. Esquema — src/features/leads/schema.ts
   - zod discriminated union por site: "design" | "cnc".
   - Comunes: name (2–80), contact (email válido o teléfono de 10–15 dígitos, un solo campo), locale ("es"|"en"), consent (true), utm_source/medium/campaign opcionales, website (honeypot vacío), startedAt (descarta envíos en < 3 s).
   - design: projectType ("kitchen"|"closet"|"custom-piece"|"commercial-space"), city opcional (2–60).
   - cnc: material ("wood"|"acrylic"|"aluminum"|"other"), projectState ("file-ready"|"needs-help"|"idea").
   - Follow-up opcional (segundo envío desde el estado de éxito): design → stage ("idea"|"measurements"|"ready-to-quote"), timeline ("now"|"1-3-months"|"later"); cnc → quantity ("1-10"|"11-100"|"100+"). Va como una segunda Server Action que manda un correo corto de "detalles adicionales" con el mismo asunto + " · detalles".
   - Errores como claves i18n.

2. Server Actions — src/features/leads/actions.ts
   - submitLead y submitLeadDetails. Honeypot o < 3 s → respuesta de éxito silenciosa sin enviar.
   - Resend: from CONTACT_FROM_EMAIL; to design → CONTACT_TO_EMAIL, cnc → CONTACT_TO_EMAIL_CNC; replyTo = contacto si es email.
   - Asuntos: "[Design] Nuevo proyecto: {projectType} — {name}" / "[CNC] Solicitud de cotización: {material} — {name}".
   - Estado tipado para useActionState: { status: "idle"|"success"|"error", fieldErrors?, values? }. Errores de Resend solo a console.error.

3. Correo interno — src/emails/lead-notification.tsx (React Email, siempre en español)
   - Marca, todos los campos con etiquetas legibles, idioma del visitante, UTM, fecha en America/Mexico_City, botón "Responder por WhatsApp" (wa.me) si el contacto es teléfono.

4. UI — src/features/leads/components/
   - LeadForm (client), variant "design" | "cnc", textos por props (ya traducidos).
     - Design: paso 1 projectType → paso 2 datos.
     - CNC: paso 1 material + projectState (dos grupos en la misma pantalla) → paso 2 datos.
     - Construido solo con componentes de src/components/ui (shadcn): Input, Label, Textarea, Checkbox, Button.
     - Option cards = shadcn RadioGroup con los items estilizados como tarjetas (flechas de teclado), con el estado seleccionado de la skill (borde + check que se dibuja).
     - Transición entre pasos: slide horizontal 240ms --ease-out con motion; altura animada (layout).
     - Pending: el botón se convierte en spinner; éxito: check dibujado + panel de detalles opcionales + botón WhatsApp solo si NEXT_PUBLIC_WHATSAPP_NUMBER existe.
     - Errores por campo con aria-describedby y foco al primero. Inputs con inputmode/autocomplete correctos, font-size ≥ 16px.
     - Lee utm_* de la URL al montar (hidden inputs). Conserva valores al cambiar de idioma (sessionStorage con try/catch).
   - LeadSheet (client): en < 768px el formulario vive en el Drawer de shadcn (vaul): drag-to-dismiss, focus trap, scroll lock, padding con safe-area, repositionInputs para el teclado. En ≥ 768px se renderiza inline en su sección (mismo LeadForm, sin duplicar lógica).
   - MobileCtaBar: barra fija inferior en móvil con el CTA de la marca; abre el sheet; se oculta cuando la sección del formulario está en pantalla.

5. Privacidad: /privacidad (es) y /en/privacy (en) en ambos hosts, texto breve (qué datos, para qué, no se venden, contacto hello@woodax.design). Revisa el enrutamiento de proxy.ts.

6. Copia a src/messages/es.json y en.json los textos de "Formulario" y "Footer" del copy deck tal cual.

Prueba local enviando a tu correo con un RESEND_API_KEY real antes del push.
```

---

## Fase 2 — Coming soon: Woodax Design

```
Lee la skill woodax-brand completa (sobre todo secciones 1, 2, 5, 6 y 7) y la sección "Woodax Design" de docs/brand/copy-deck.md. Construye src/app/[locale]/(design)/page.tsx. Copia los textos del copy deck a messages tal cual; si falta alguno, crea la clave con TODO(copy) y avísame.

Estructura (una página, sin menú):
1. Header: SiteNav compartido exactamente como la skill woodax-brand sección 10 (Menu + Sheet a la izquierda, logo al centro, CTA pill a la derecha; en móvil isotipo + hamburguesa). El selector ES/EN vive dentro del Sheet.
2. Hero como card redondeada insertada debajo del nav (skill sección 10): HeroMedia con poster = la mejor foto de public/images/design/ (videoSrc vacío por ahora). Overlay charcoal según la skill. Eyebrow, headline (dos líneas, una por oración), subhead, ctaPrimary (abre el sheet en móvil / scroll al form en desktop) y ctaSecondary (scroll a Proyectos). Intro "Woodax" de la skill sección 5, con botón "Saltar".
3. Para quién: bloque full-bleed woodax-green, texto charcoal, dos columnas (Tu hogar / Tu negocio) con icono lucide de 1.5px de trazo, motivo de arcos del logo en cream al .35.
4. Proyectos: sobre cream, 4–6 fotos desde src/content/design-gallery.ts (src, alt ES/EN, tag). Grid editorial: en móvil scroll horizontal con snap (sensación nativa), en desktop mosaico asimétrico. Debajo, link "Más proyectos en Instagram" con instagramUrl de site-config; si no existe, no se renderiza.
5. Así trabajamos: tres pasos, número grande en Playfair 400, título y una línea.
6. Formulario: bloque full-bleed woodax-green con el LeadForm variant="design" sobre una card cream (radius-card). En móvil la sección muestra solo el título + botón que abre el sheet.
7. Footer: logo pequeño, ubicación, Instagram, link a NEXT_PUBLIC_CNC_URL con el texto cncLink, privacidad.
8. MobileCtaBar con mobileBar.

SEO/GEO:
- generateMetadata desde messages (meta.title/description), alternates.languages es/en, canonical con NEXT_PUBLIC_DESIGN_URL, Open Graph 1200x630 con una foto real.
- JSON-LD HomeAndConstructionBusiness: name, url, areaServed "Querétaro", sameAs [instagramUrl] solo si existe, knowsAbout ["custom kitchens","closets","custom furniture","commercial interiors"]. Sin teléfono ni dirección.
- Un solo h1, landmarks, headings en orden.

Calidad: Lighthouse móvil ≥ 90 Performance, 100 Accessibility/SEO, CLS < 0.05. Revisa con la skill web-design-guidelines al terminar y corrige lo que marque.
```

---

## Fase 3 — Coming soon: CNC by Woodax Design

```
Lee la skill woodax-brand completa (sobre todo secciones 1, 3, 5, 6 y 7) y la sección "CNC by Woodax Design" del copy deck. Construye src/app/[locale]/cnc/page.tsx (en producción es cnc.woodax.design/). Textos del copy deck tal cual.

Estructura:
1. Header: el mismo SiteNav con variant="cnc" (skill sección 10).
2. Hero como card insertada con borde cnc-line y radio 6px (skill sección 10): retícula técnica de fondo con marcas de registro en esquinas, coordenadas en mono (cnc-muted). HeroMedia con poster de public/images/cnc/ si existe; si no hay foto, solo la retícula (no inventes imagen). Eyebrow, headline, subhead, ctaPrimary (botón blanco), ctaSecondary (outline). Intro "CNC" de la skill sección 5 con "Saltar".
3. Dos formas de trabajar: dos paneles cnc-surface lado a lado (apilados en móvil), label "01"/"02" en mono, título y cuerpo.
4. Materiales: filas tipo tabla técnica (Madera / Acrílico / Aluminio delgado). Columnas de especificación (espesor máx., área de corte) solo si existen en site-config.cncSpecs; si no, la fila muestra solo el material y su descripción. Revelado tipo plotter de izquierda a derecha.
5. Hecho para: tres bloques (Talleres / Empresas e industria / Rotulistas) con icono lucide de trazo fino.
6. Del archivo a la pieza: tres pasos numerados en mono con una línea de trayectoria que los conecta (SVG, se dibuja al entrar) + nota de formatos.
7. Trabajos: solo si hay fotos en public/images/cnc/ (src/content/cnc-gallery.ts); si no, la sección no existe.
8. Formulario: LeadForm variant="cnc" en panel cnc-surface con borde cnc-line. En móvil, sheet.
9. Footer: CncLogo pequeño, ubicación, Instagram (site-config), link a NEXT_PUBLIC_DESIGN_URL con designLink, privacidad.
10. MobileCtaBar con mobileBar.

SEO/GEO: igual que Woodax con meta de CNC, canonical NEXT_PUBLIC_CNC_URL y JSON-LD LocalBusiness con parentOrganization → Woodax Design, knowsAbout ["CNC router cutting","CNC router rental","acrylic cutting","aluminum cutting","MDF cutting","signage"].

Calidad: mismos objetivos. Contraste AA en todo el texto sobre cnc-bg (cnc-muted solo para texto ≥ 14px). Revisa con web-design-guidelines.
```

---

## Fase 2B — Ajustes de layout en ambas páginas (las Fases 2 y 3 ya están hechas)

```
Contexto: las páginas de Woodax Design y CNC ya existen (Fases 2 y 3). NO las reconstruyas desde cero: modifica lo que hay. Antes de tocar código, vuelve a leer completas las secciones 6, 9, 10 y 11 de .agents/skills/woodax-brand/SKILL.md y las secciones "Navegación" y "Secciones nuevas" de docs/brand/copy-deck.md.

Paso 0 — Inventario (no cambies nada aún)
Lista los componentes actuales de cada página (header, hero, secciones, footer) y cómo vas a mapearlos a la nueva estructura. Espera mi OK antes del paso 1.

Paso 1 — Navbar compartida
- Crea o reemplaza src/components/site/site-nav.tsx (variant "design" | "cnc"): pill flotante que colapsa al hacer scroll, exactamente según la skill sección 10 (estado expandido, estado colapsado, móvil, accesibilidad). Usa Button y Sheet de shadcn (agrega `sheet` con el CLI si no está) y motion para la animación de ancho y el indicador de sección activa.
- Scrollspy con IntersectionObserver sobre los ids de sección; el indicador se mueve con layoutId.
- Reemplaza el header actual de ambas páginas por SiteNav. Elimina el header viejo y el código que quede sin uso.
- El selector ES/EN va en la pill (desktop) y en el Sheet (móvil); conserva ruta y valores del formulario como ya funciona.
- Verifica la animación con review-animations: interrumpible, sin layout shift del contenido, reduced motion respetado.

Paso 2 — Hero como tarjeta insertada
- Convierte el hero de ambas páginas en la tarjeta insertada bajo la navbar (skill sección 10). Conserva HeroMedia, la intro y los textos actuales.
- Agrega el icon chip (skill sección 11) en el h1 solo si existe el SVG del isotipo correspondiente.

Paso 3 — Secciones
Woodax, orden final: Hero → Statement → Para tu hogar y tu negocio → Proyectos (project cards) → Así trabajamos (numbered row) → Formulario → Footer de cierre.
CNC, orden final: Hero → Statement → Dos formas de trabajar → Materiales → Hecho para → Del archivo a la pieza (numbered row) → Trabajos (solo si hay fotos) → Formulario → Footer de cierre.
- Statement paragraph con rich text de next-intl (<b> → peso 500 + color foreground). Sin cursivas en ningún lado.
- Cada sección lleva el section label (punto + eyebrow) con las claves del copy deck.
- Proyectos/Trabajos con el patrón project cards (scroll-snap con peek en móvil).
- Así trabajamos / Del archivo a la pieza con el patrón numbered row.

Paso 4 — Footer ultra minimalista
- Reemplaza el footer actual por el de la skill sección 13 en ambas marcas (sin bloque oscuro ni wordmark gigante). Iconos de Facebook/Instagram como SVG inline (Simple Icons), Mail con lucide. Agrega facebookUrl a site-config.
- Crea /terminos (es) y /en/terms (en) con el mismo layout que privacidad; contenido TODO(legal) y noindex hasta tener el texto final.

Paso 5 — Consentimiento de cookies
- Pídeme la ruta del componente de cookies del repo de Noctra Studio (yo te paso los archivos). Pórtalo según la skill sección 14: mismas categorías y UX, tokens y shadcn de este proyecto, textos en messages, cookie woodax_consent de 400 días compartida entre woodax.design y cnc.woodax.design.

Paso 6 — Cambio de idioma sin recarga
- Encuentra por qué el cambio de idioma hoy hace recarga completa (anchor, window.location, refresh o el proxy) y corrígelo según la skill sección 15. Verifica la prueba de aceptación en ambas marcas y en un preview con ?site=cnc.

Reglas
- Todos los textos desde messages (copia los nuevos del copy deck tal cual). Nada inventado.
- Solo componentes de src/components/ui (shadcn) y los tokens de la skill.
- Revisa con review-animations, mobile-native y web-design-guidelines al final y corrige lo que marquen.
- pnpm typecheck, lint y build sin errores. Un commit por paso (Conventional Commits en inglés). Push a staging y pásame el link del preview.
```

---

## Actualización de marca — guideline oficial (Playfair + Quicksand, colores oficiales, franjas)

```
Llegó el brand guideline oficial de Woodax y cambia tipografía, colores y motivo. Lee completas las secciones 2, 3, 4, 5, 9 y 10 actualizadas de .agents/skills/woodax-brand/SKILL.md antes de tocar código. No cambies estructura ni textos: es un cambio de tokens y estilos.

Paso 0 — Inventario (sin cambios)
Lista dónde se usan hoy Outfit, los HEX viejos de Woodax (#83AF6E, #A2C392, #3F3738, #F4F1EC, #E7E0D5) y el motivo de arcos. Espera mi OK.

Paso 1 — Tipografía
- Quita Outfit. Agrega con next/font/google: Playfair Display (400, 700) como --font-serif y Quicksand (400, 500, 600) como --font-sans. JetBrains Mono se queda como --font-mono.
- Woodax: titulares, statement y números de la fila numerada en Playfair; texto, navbar, botones, formularios y eyebrows en Quicksand (body en 500). Escala exacta de la sección 4.
- CNC: todo en Quicksand + JetBrains Mono para datos. Nada de Playfair en CNC. Verifica que visualmente CNC se vea igual que antes salvo la fuente.
- Sin cursivas en ningún lado.

Paso 2 — Colores oficiales de Woodax
- Reemplaza los tokens por los de la sección 2 (green #8BAF64, lime #A7CB5F, charcoal #483D3C, cream #E5E1D1, paper #F3F1EA, stripe #7A7576) y actualiza el mapeo de variables de shadcn (sección 9) y los valores glass de la navbar (sección 10).
- Regla nueva: sobre bloques verdes solo texto grande (≥ 24px regular / ≥ 19px bold). Cualquier texto corrido que hoy esté directo sobre verde va dentro de una card cream. Revisa la sección "Para tu hogar y tu negocio" y el bloque del formulario.
- Los tokens de CNC NO cambian.

Paso 3 — Motivo de franjas onduladas
- Elimina el motivo de arcos. Crea src/components/brand/wave-stripes.tsx (SVG inline, aria-hidden) según la sección 2: 2–3 curvas en S paralelas, trazo grueso con extremos redondeados, que se salen del borde de la sección. Variantes: "on-paper" (stripe 18–25%) y "on-green" (cream 30%).
- Úsalo máximo 2 veces en Woodax: una saliendo del borde del hero/statement y otra en el bloque verde. Nunca detrás de texto corrido. Animación de entrada de la sección 5 (estática con reduced motion).

Paso 4 — QA
- Contraste AA en todo el texto (usa la tabla de la sección 2). Revisa con web-design-guidelines y review-animations.
- Capturas de antes y después de Woodax (desktop y móvil) y de CNC para confirmar que CNC no cambió de carácter.
Un commit por paso (Conventional Commits en inglés), push a staging y link del preview.
```

---

## Fase CNC — Sitio completo (one-page, producción) sobre lo que ya existe

```
Contexto: Adrián aprobó la página de CNC. Pasa de "coming soon" a sitio completo, sigue siendo una sola página en cnc.woodax.design y se construye SOBRE lo que ya existe: no reconstruyas componentes que ya funcionan. Woodax Design se queda como coming soon. Antes de tocar código lee completas las secciones 1, 3, 7, 10, 11, 13, 14, 15 y 17 de .agents/skills/woodax-brand/SKILL.md y la sección "CNC — sitio completo" de docs/brand/copy-deck.md.

Paso 0 — Inventario (sin cambios)
Lista los componentes actuales de la página de CNC y, para cada uno: se queda igual / se ajusta / es nuevo. Marca todo texto o meta que diga "coming soon", "abriendo", "nuevo sitio" o similar. Espera mi OK.

Paso 1 — Hero con media + grid encima
- Agrega a src/content/site-config.ts: cncHero = { type: "none", src: undefined, poster: undefined, alt: undefined } con su tipo.
- HeroMedia soporta video e imagen según la skill sección 7 y el orden de capas de la sección 17: media → overlay cnc-bg 55% → grid siempre visible → marcas/coordenadas → contenido.
- Con type "none" debe verse exactamente como hoy. Prueba los tres modos con un video y una imagen temporales locales (no los subas al repo) y verifica contraste AA sobre el cuadro más brillante.

Paso 2 — Quitar el modo coming soon de CNC
- Actualiza meta (title/description del copy deck), Open Graph y JSON-LD. Quita cualquier texto de coming soon.
- noindex fuera solo para el host de CNC en producción (staging y previews siguen con noindex). Revisa robots.ts y sitemap.ts por host.

Paso 3 — Secciones nuevas
- Capacidades: tabla técnica (filas tipo plotter de la skill sección 3) desde site-config.cncSpecs. Extiende el tipo con workArea?, maxThickness? (por material), tolerance?, leadTime?, minimumOrder?. Cada fila se renderiza solo si su dato existe; si no hay ninguno, la sección no existe y su ancla tampoco.
- Trabajos: el patrón project cards con src/content/cnc-gallery.ts (sigue oculta si está vacía).
- FAQ: shadcn Accordion (agrégalo con el CLI). Las preguntas viven en messages; las respuestas en src/content/cnc-faq.ts por id y idioma. Solo se renderizan las que tengan respuesta. Si ninguna tiene, la sección no existe.
- Orden final: Hero → Statement → Dos formas de trabajar → Capacidades → Materiales → Hecho para → Del archivo a la pieza → Trabajos → FAQ → Formulario → Footer.
- Anclas de la pill: Servicio · Capacidades (o Materiales si Capacidades no existe) · Contacto.

Paso 4 — Formulario v2 (detalles opcionales)
- El alta rápida de 2 pasos no cambia. En el estado de éxito, un formulario corto opcional: medidas (texto), cantidad (radio 1–10 / 11–100 / 100+), fecha límite (date input nativo), link de archivo (URL validada con zod). Envía con submitLeadDetails (ya existe) y un correo "[CNC] … · detalles".
- Sin carga de archivos en esta versión.

Paso 5 — SEO/GEO de producción
- JSON-LD: LocalBusiness (ya existe) + un Service por modalidad (renta de tiempo de máquina, producción en volumen) con areaServed Querétaro. FAQPage solo con las preguntas publicadas.
- Imagen Open Graph generada con next/og (src/app/[locale]/cnc/opengraph-image.tsx): fondo cnc-bg, retícula, logo blanco y el titular. Una por idioma.
- Revisa que el h1, los headings y los landmarks sigan en orden con las secciones nuevas.

Paso 6 — QA
- Corre break-ui sobre la página de CNC (textos largos en EN, sin specs, sin fotos, sin FAQ, con todo lleno) y review-animations / mobile-native / web-design-guidelines. Corrige lo que marquen.
- Lighthouse móvil ≥ 90 / 100 / 100 en el preview con ?site=cnc.

Reglas: textos solo desde messages (copia los nuevos del copy deck tal cual), nada inventado, solo shadcn + tokens de la skill, un commit por paso (Conventional Commits en inglés), push a staging y link del preview al final de cada paso.
```

---

## Fase 4 — QA antes de mostrarle a Adrián

```
Revisa sin agregar features:
- 360, 390, 430, 768, 1024, 1440 px: sin scroll horizontal, targets ≥ 44px, safe-area correcta en iPhone.
- Intro: una vez por sesión, se salta con tap, no aparece con reduced motion, no bloquea input ni retrasa LCP.
- Bottom sheet: drag-to-dismiss, foco atrapado, teclado no tapa inputs, scroll del body bloqueado.
- Cambio de idioma conserva ruta y valores del formulario, en ambas marcas.
- Preview Vercel: ?site=cnc / ?site=design. /cnc en el host de Design → 301 al subdominio.
- sitemap.ts/robots.ts correctos por host e idioma; staging con noindex.
- Envío real de ambos formularios + follow-up: llegan a hello@ y cnc@ con asunto correcto y reply-to.
- Ningún string visible fuera de messages; ningún dato inventado (revisa contra la skill sección 1).
- Todos los primitivos vienen de src/components/ui (shadcn); no hay botones/inputs hechos a mano ni estilos de marca sueltos fuera de globals.css y las variantes cva. Borra /dev/ui o confirma que da 404 en producción.
- pnpm typecheck, lint y build sin warnings.
Entrega lista de lo corregido y lo pendiente.
```

---

## Pendientes fuera del código (tú)

0. **DNS en Vercel (nameservers)**, en este orden para no tumbar el correo:
   1. Captura de todos los registros actuales en Squarespace.
   2. Agrega woodax.design en Vercel → Domains (no cambies nameservers aún).
   3. Recrea en Vercel DNS los registros de Google Workspace con valores exactos: MX (`smtp.google.com` prioridad 1, o los 5 `aspmx…` si así estaban), `TXT @ v=spf1 include:_spf.google.com ~all`, `TXT google._domainkey` (DKIM), `TXT _dmarc v=DMARC1; p=none; rua=mailto:hello@woodax.design`, `google-site-verification` y cualquier otro de la captura.
   4. Agrega los registros de Resend.
   5. Cambia nameservers en Squarespace a los de Vercel.
   6. Verifica: correo de ida y vuelta en hello@, `dig MX woodax.design`, DKIM "Authenticating" en Admin console.
1. **Resend**: verificar woodax.design (subdominio `send`) con registros en Vercel DNS.
2. **Workspace**: Admin console → Users → hello@ → Alternate email → agrega `cnc`.
3. **Gmail**: filtro `to:(cnc@woodax.design)` → etiqueta "CNC"; `subject:"[Design]"` → "Woodax Design".
4. **Adrián**: aprobar copy deck (⚠︎), WhatsApp, URL de Instagram, specs del router (área de corte, espesores por material), formatos de archivo aceptados, video(s) del hero.
5. **Producción** (tras aprobación): asignar `woodax.design` (+ `www` → redirect) y `cnc.woodax.design` al proyecto en Vercel.
