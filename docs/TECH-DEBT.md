# Deuda técnica post-lanzamiento

No hacer antes del merge a producción. Ordenado por el diagnóstico de LCP móvil (Lighthouse simulado, producción local, octubre 2026).

El elemento LCP es texto, no una imagen: en Design es el `h1` del hero; en CNC, el subhead. En el trace sin throttling pinta a los 132 ms (Design) y 220 ms (CNC). La puntuación usa el LCP simulado (CPU ×4, ~560 ms de latencia por request): ~3.7 s en Design y ~3.9 s en CNC, y cae encima del TTI. El hueco de ~2.6 s está entre el FCP simulado (~1.1 s, CSS de bloqueo) y el fin de la evaluación de JS (`react-dom`, `motion`, lucide, zod). TTFB observado: 30–60 ms. AVIF no mueve este LCP.

1. **Reducir el JS inicial.** Hero como Server Component. `motion` → `LazyMotion` / `m`, o CSS. Lucide y la ilustración de Materiales fuera del bundle inicial. Zod fuera del cliente. Impacto esperado: LCP simulado de ~3.7 s a ~1.1–1.5 s.
2. **No descargar el mp4 del hero durante la carga inicial (CNC).** En el trace el vídeo de 2.3 MB entra a los ~413 ms y el póster coincide con el paint del subhead. Impacto esperado: unos cientos de milisegundos, solo en CNC.
3. **CSS crítico del hero.** Hoy bloquean el render ~66 KB sin comprimir (~13 KB transferidos) más un chunk de ~1–2 KB. Eso explica el FCP simulado a ~1.1 s. El LCP casi no baja hasta que el JS deje de marcar el TTI.
4. **AVIF y `no-store` / bfcache.** Impacto bajo en este LCP, porque el elemento es texto y el TTFB ya es de decenas de milisegundos. AVIF queda para posters y galería, después de confirmar calidad con Adrián. `Cache-Control: no-store` en el HTML dinámico impide bfcache; medirlo antes de cambiar la política.
