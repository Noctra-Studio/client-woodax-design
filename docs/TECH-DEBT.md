# Deuda técnica post-lanzamiento

No hacer antes del merge a producción. Quedan para un ciclo posterior:

1. **Separar Zod** entre bundle de cliente y servidor, para no arrastrar validación de entorno al cliente.
2. **Server Components / LazyMotion** en secciones CNC animadas, para recortar JS del first load.
3. **AVIF** (y srcset moderno) para posters y galería, después de confirmar calidad visual con Adrián.
4. **Cache-Control `no-store` / bfcache** en HTML: hoy no se toca; hay que medir el impacto en LCP y en el back-forward cache antes de cambiar la política de las páginas.

Estas cuatro quedaron fuera a propósito del lanzamiento.
