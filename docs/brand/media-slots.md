# Slots de foto — Woodax Design

Cada espacio de foto del sitio multipágina está en `src/content/design-media.ts`. `src: null` es un placeholder: se dibuja en Preview y en local, y no se renderiza en Production (`VERCEL_ENV=production`). El archivo esperado usa el sufijo `-vN` porque `/images` se sirve con caché immutable: al reemplazar una foto, sube el número.

El tamaño sale de la proporción × 400 (4/5 → 1600×2000). Un logo 1/1 va a 1600×1600.

| id                     | página / sección                       | ratio | tamaño recomendado (px) | archivo esperado                                   | estado    |
| ---------------------- | -------------------------------------- | ----- | ----------------------- | -------------------------------------------------- | --------- |
| home-hero              | Inicio / hero                          | 4/5   | 1600×2000               | public/images/design/home-hero-v1.jpg              | ✅        |
| home-audience-home     | Inicio / Lo que hacemos · hogar        | 4/5   | 1600×2000               | public/images/design/home-audience-home-v1.jpg     | ✅        |
| home-audience-business | Inicio / Lo que hacemos · negocio      | 4/5   | 1600×2000               | public/images/design/home-audience-business-v1.jpg | ✅        |
| projects-1             | Inicio / proyectos · cocina            | 4/5   | 1600×2000               | public/images/design/projects-1-v1.jpg             | ✅        |
| projects-2             | Inicio / proyectos · clóset            | 4/5   | 1600×2000               | public/images/design/projects-2-v1.jpg             | ✅        |
| projects-3             | Inicio / proyectos · pieza a medida    | 4/5   | 1600×2000               | public/images/design/projects-3-v1.jpg             | ✅        |
| projects-4             | Inicio / proyectos · espacio comercial | 4/5   | 1600×2000               | public/images/design/projects-4-v1.jpg             | ✅        |
| projects-5             | Inicio / proyectos · clóset            | 4/5   | 1600×2000               | public/images/design/projects-5-v1.jpg             | ✅        |
| projects-6             | Inicio / proyectos · pieza a medida    | 4/5   | 1600×2000               | public/images/design/projects-6-v1.jpg             | ✅        |
| services-kitchens      | Servicios / cocinas                    | 4/3   | 1600×1200               | public/images/design/services-kitchens-v1.jpg      | ✅        |
| services-closets       | Servicios / clósets                    | 4/3   | 1600×1200               | public/images/design/services-closets-v1.jpg       | ✅        |
| services-custom        | Servicios / piezas a medida            | 4/3   | 1600×1200               | public/images/design/services-custom-v1.jpg        | ✅        |
| services-commercial    | Servicios / espacios comerciales       | 4/3   | 1600×1200               | public/images/design/services-commercial-v1.jpg    | ✅        |
| about-workshop-1       | Nosotros / taller                      | 4/3   | 1600×1200               | public/images/design/about-workshop-1-v1.jpg       | pendiente |
| about-workshop-2       | Nosotros / taller                      | 4/3   | 1600×1200               | public/images/design/about-workshop-2-v1.jpg       | pendiente |
| about-workshop-3       | Nosotros / taller                      | 4/3   | 1600×1200               | public/images/design/about-workshop-3-v1.jpg       | pendiente |
| about-workshop-4       | Nosotros / taller                      | 4/3   | 1600×1200               | public/images/design/about-workshop-4-v1.jpg       | pendiente |
| about-portrait         | Nosotros / retrato                     | 4/5   | 1600×2000               | public/images/design/about-portrait-v1.jpg         | pendiente |
| clients-logo-1         | Clientes / logos                       | 1/1   | 1600×1600               | public/images/design/clients-logo-1-v1.jpg         | pendiente |
| clients-logo-2         | Clientes / logos                       | 1/1   | 1600×1600               | public/images/design/clients-logo-2-v1.jpg         | pendiente |
| clients-logo-3         | Clientes / logos                       | 1/1   | 1600×1600               | public/images/design/clients-logo-3-v1.jpg         | pendiente |
| clients-logo-4         | Clientes / logos                       | 1/1   | 1600×1600               | public/images/design/clients-logo-4-v1.jpg         | pendiente |
| clients-logo-5         | Clientes / logos                       | 1/1   | 1600×1600               | public/images/design/clients-logo-5-v1.jpg         | pendiente |
| clients-logo-6         | Clientes / logos                       | 1/1   | 1600×1600               | public/images/design/clients-logo-6-v1.jpg         | pendiente |
| contact-side           | Contacto / lateral                     | 3/4   | 1200×1600               | public/images/design/contact-side-v1.jpg           | ✅        |

Los slots con ✅ tienen foto, `width`, `height` y alt en español e inglés. El resto sigue en `TODO(copy)` y se dibuja como placeholder fuera de Production. El alt no se muestra en el marco; solo lo lee la foto real.

## Cómo subir una foto

1. Exporta el JPG al tamaño de la tabla.
2. Guárdalo como `public/images/design/{id}-v1.jpg`. Si esa ruta ya se publicó, usa el siguiente sufijo (`-v2`, `-v3`) y no reescribas el archivo anterior.
3. En el slot de `src/content/design-media.ts`, pon `src` en `/images/design/{id}-v1.jpg` y completa `width` y `height` con los píxeles del archivo. Sustituye el alt `TODO(copy)` por el texto aprobado en español e inglés. En Nosotros o Clientes, pasa `placeholder` a `false` solo cuando el texto ya es el de Adrián y, en Nosotros, cuando además hay al menos una foto real.
