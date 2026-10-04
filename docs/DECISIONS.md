# Decisiones

## Un solo repositorio

Woodax Design y CNC by Woodax Design son dos marcas hermanas que comparten stack, internacionalización, formulario de contacto y un único deploy. Un solo repo evita duplicar esa base mientras las páginas de coming soon conviven y, después, cuando las reemplacen los sitios completos.

## Subdominio para CNC

`woodax.design` sirve Woodax Design. `cnc.woodax.design` sirve CNC. El host elige el sitio dentro del mismo deploy: Design será multipágina y CNC se queda en una sola página, cada una con su URL. En el host de Design, una ruta `/cnc` redirige al subdominio de CNC.

## Sitio bilingüe es/en

Los dos sitios se publican en español e inglés. El español es el idioma por defecto y no lleva prefijo. El inglés vive bajo `/en`. Así las URLs en español quedan limpias y el cambio de idioma es el mismo en ambas marcas.

## Resend sin base de datos en la Fase 1

Esta fase solo captura el contacto del coming soon y lo envía por correo. Resend cubre ese envío. No hay base de datos: Supabase queda fuera de alcance hasta que haga falta guardar los leads.

## Hosting en Vercel

`NEXT_PUBLIC_APP_ENV` se define por entorno en el panel de Vercel (`production` / `staging`). Los secretos (`RESEND_API_KEY` y el resto) se configuran en el panel y no entran al repositorio.

En producción el sitio sigue el host. En un preview de Vercel la URL es única y termina en `.vercel.app`, así que `?site=cnc` o `?site=design` fuerza la marca y la elección queda en la cookie `preview-site`. En production esa vía se ignora.

El DNS del dominio se administra en Vercel.
