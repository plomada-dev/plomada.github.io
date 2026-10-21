# Plomada — sitio web (prototipo)

Sitio estático de una página, en español (`/`) e inglés (`/en/`). No necesita compilación: se publica la carpeta tal cual.

## Contenido

| Archivo | Qué es |
| --- | --- |
| `index.html` | Landing en español |
| `en/index.html` | Landing en inglés |
| `gracias.html`, `en/thanks.html` | Páginas que ve el visitante después de enviar el formulario |
| `404.html` | Página de error para direcciones inexistentes |
| `assets/css/styles.css` | Estilos de todo el sitio (escritorio, tableta y móvil) |
| `assets/img/` | Logos SVG, imagen para redes (`og-image.png`) e ícono para iPhone |
| `favicon.ico` | Ícono de la pestaña (16, 32 y 48 px) |
| `CNAME` | Dominio propio para GitHub Pages (`plomada.tech`) |
| `.nojekyll` | Le dice a GitHub Pages que publique los archivos tal cual (sin Jekyll) |
| `robots.txt` | Bloquea buscadores mientras es prototipo |

## Publicar en GitHub Pages

El sitio se publica en el repositorio `plomada-dev/plomada.github.io` y se sirve en el dominio propio `plomada.tech` (archivo `CNAME`).

1. Subir los cambios al repositorio: `git push`.
2. En GitHub: **Settings › Pages › Build and deployment › Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En **Settings › Pages › Custom domain**, confirmar `plomada.tech` (ya viene en el archivo `CNAME`) y marcar *Enforce HTTPS*.
4. En el DNS del dominio, apuntar `plomada.tech` a GitHub Pages: registros `A` a `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (y un `CNAME` de `www` a `plomada-dev.github.io` si se usa `www`).

Cada `git push` a `main` vuelve a publicar el sitio.

## Formulario de contacto

El formulario **no usa servidor**: al enviarlo, arma un mensaje de WhatsApp con los datos (nombre, email, WhatsApp y consulta) y abre el chat con Plomada ya escrito. El número está en el atributo `data-wa` de cada `<form>` (`index.html` y `en/index.html`) y la lógica, en `assets/js/main.js`.

Las páginas `gracias.html` y `en/thanks.html` quedaron de la versión anterior (Netlify) y ya no se usan; se pueden borrar o reutilizar.

## Datos de contacto en el sitio

- WhatsApp: +598 95 838 807 (los botones abren el chat con un mensaje inicial).
- Email: hola@plomada.tech

Para cambiarlos, buscar y reemplazar en `index.html`, `en/index.html`, `gracias.html`, `en/thanks.html` y `404.html`.

## Versión demo (v3)

Esta versión es un demo para presentación. Los proyectos (Masa Madre Lab, VetSur, Fletera Oriental), sus casos detallados, los testimonios, las cifras de resultados y los avatares son ilustrativos. Una franja arriba de cada página lo aclara (`<div class="demo-aviso">`).

Interacciones de esta versión:

- **Garantías** debajo del botón principal: precio cerrado, plazos por escrito, garantía después de la entrega.
- **Casos de proyecto**: el botón "Ver caso" de cada proyecto abre una ventana con desafío, solución, resultados, duración y servicios.
- **Agenda del diagnóstico gratis** (simulada): elige día, horario y datos, y muestra la confirmación. No envía nada todavía; en la versión real se conectaría a un calendario (Calendly, Cal.com o Google Calendar).

> La calculadora de presupuesto se retiró para el lanzamiento. Su código quedó respaldado en `assets/_estimador-es.html.bak` y `assets/_estimador-en.html.bak`.

Antes de publicarla como sitio real hay que reemplazar esos contenidos por casos y testimonios reales y quitar la franja de demo. Los textos están en `index.html` y `en/index.html`; los efectos de interacción, en `assets/js/main.js` y al final de `assets/css/styles.css`.

## Antes de lanzar públicamente

- [ ] Quitar el bloqueo de buscadores: la línea `<meta name="robots" content="noindex, nofollow">` de cada página y el contenido de `robots.txt`.
- [ ] Verificar el dominio `plomada.tech` en *Settings › Pages* y activar *Enforce HTTPS*.
- [ ] Con el dominio activo, cambiar `og:image` por la dirección completa (`https://plomada.tech/assets/img/og-image.png`) para que la vista previa en WhatsApp y redes funcione siempre.
- [ ] Definir el precio definitivo de "Despliegue y operación" y el texto de la nota con asterisco (ver comentario `REVISAR` en el HTML).
- [ ] Reemplazar los contenidos ilustrativos (proyectos, testimonios, cifras) por reales y quitar la franja de demo (`<div class="demo-aviso">`).
