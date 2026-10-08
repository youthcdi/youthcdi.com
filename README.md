# youthcdi.com — sitio web de la YCDI

Sitio estático para **GitHub Pages**. No requiere compilación: todo el contenido se edita en archivos JSON y Markdown.

## Estructura

```
index.html            The Organization (home)
resolutions.html      Resolutions & Projects
observatory.html      State of Democracy Observatory (mapa + artículos)
article.html          Plantilla de lectura de cada artículo (?a=slug)
404.html              Página de error
CNAME                 Dominio personalizado (youthcdi.com)
assets/
  css/                Estilos (main.css = tokens del manual de marca)
  js/site.js          Encabezado, pie, correo, redes y formularios  ← CONFIGURACIÓN
  js/home.js, observatory.js
  logos/              Logotipos oficiales (SVG y PNG)
  img/board|events|articles/   Fotografías
  vendor/             d3, topojson-client, marked (copias locales)
data/
  board.json          Junta directiva
  events.json         YCDI Around the World
  resolutions.json    Resoluciones, declaraciones y proyectos
  countries.json      Perfiles por país del Observatorio (DATOS DE EJEMPLO)
  articles.json       Índice de artículos
  world-50m.json      Mapa mundial (Natural Earth, claves ISO alfa-3)
observatory/articles/ Texto de cada artículo en Markdown (<slug>.md)
documents/            PDF de resoluciones y declaraciones
```

## Tareas frecuentes

**Cambiar correo, redes o el formulario del newsletter** → `assets/js/site.js`, objeto `SITE`.
- `newsletterForm`: enlace de Microsoft Forms (Compartir → Copiar vínculo).
- `newsletterEmbed`: opcional, URL de "Insertar" para mostrar el formulario dentro de la página.
- `articleSubmissionForm`: opcional, formulario para enviar artículos al Observatorio.
Mientras estén vacíos, los botones abren un correo a youth@idc-cdi.com.

**Foto de un miembro de la junta** → sube una imagen cuadrada (mín. 600×600) a `assets/img/board/` y escribe el nombre del archivo en `"photo"` dentro de `data/board.json`.

**Nuevo evento** → agrega un bloque al inicio de `data/events.json` (foto horizontal en `assets/img/events/`). Pon `"sample": false`.

**Nueva resolución o declaración** → sube el PDF a `documents/` y agrega un bloque en `data/resolutions.json` con `"file": "nombre.pdf"`.

**Nuevo artículo del Observatorio**
1. Crea `observatory/articles/mi-articulo.md` con el texto (Markdown: `## Subtítulo`, `**negrita**`, `> cita`).
2. Agrega su ficha al inicio de `data/articles.json`: `slug` (= nombre del archivo sin .md), título, autor, partido, fecha `AAAA-MM-DD`, `countries` con códigos ISO alfa-3 (`COL`, `ESP`, `VEN`…), tema y resumen.
3. Imagen opcional en `assets/img/articles/`.
El artículo aparece automáticamente en el listado, en el panel del país y como punto dorado en el mapa.

**Datos de un país** → `data/countries.json`, clave = código ISO alfa-3. Los valores actuales son **ficticios** (`"sample": true`). Al cargar datos reales y verificados cambia `"sample"` a `false`; cuando ningún país tenga `sample: true` desaparece el aviso de "Example data".

Los JSON no admiten comas al final de la última línea de una lista; si la página deja de cargar algo, valida el archivo en https://jsonlint.com.

## Probar en local

Abrir los HTML con doble clic no funciona (el navegador bloquea la lectura de los JSON). Desde la carpeta del repositorio:

```
python3 -m http.server 8000
```
y abre http://localhost:8000

## Publicar en GitHub Pages con youthcdi.com

1. Crea un repositorio (p. ej. `youthcdi.com`) y sube todo el contenido de esta carpeta a la rama `main`.
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En **Settings → Pages → Custom domain** escribe `youthcdi.com` (el archivo `CNAME` ya lo incluye).
4. En el proveedor donde compres el dominio, configura el DNS:
   - Cuatro registros **A** para `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Un registro **CNAME** para `www` → `TU-USUARIO.github.io`
5. Cuando GitHub verifique el dominio (puede tardar hasta 24 h), activa **Enforce HTTPS**.

Recomendado: en **Settings → Pages** verifica el dominio a nivel de cuenta para evitar que otra persona lo reclame.

## Marca

Colores, tipografías (Montserrat y Source Serif 4) y reglas siguen el *Manual de marca YCDI v1.0*. Los tokens están al inicio de `assets/css/main.css`.

## Licencias de terceros

d3 y topojson-client (ISC), marked (MIT), mapa world-atlas / Natural Earth (dominio público).
