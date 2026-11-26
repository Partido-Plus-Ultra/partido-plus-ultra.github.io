# Registro de Cambios (CHANGELOG)

Todos los hitos relevantes del repositorio `Partido-Plus-Ultra/partido-plus-ultra.github.io` y su publicación en `https://partido-plus-ultra.github.io/`.

---

## [2026-11-26] — Tablero ciudadano real, portada en 4 ejes, FAQ y página `/propuestas/`

- Añadido `src/data/avance-ciudadano.json` y nueva prueba unitaria en `tests/integrity.test.mjs` para auditar métricas ciudadanas reales en cero inicial (`firmasRopVerificadas`, `militantesDigitalesVerificados`, `comitesProvincialesConstituidos`) y enlaces `canalesOficiales`.
- Creada la ruta `src/pages/propuestas.astro` (`/propuestas/`) y registrada en `src/pages/sitemap.xml.ts`, exponiendo pilares fundacionales vigentes, método de los tres poderes y ejes programáticos marcados explícitamente como pendientes de acta.
- Renovada la portada (`src/pages/index.astro`) con tablero de 4 métricas reales ampliadas, bloque de 4 ejes numerados (*Ideología y Doctrina*, *Plan de Gobierno*, *Ascenso y Militancia*, *Escuela Política*), cierre destacado con Kit WhatsApp y acordeón de Preguntas Frecuentes (`AccordionFaq.astro`).
- Actualizado `src/components/SiteFooter.astro` para enlazar `/propuestas/` y mostrar únicamente canales oficiales verificados no nulos.

## [2026-11-24] — Separación criptográfica por nivel, dominio propio, WhatsApp y borrador fundacional (`dd1b168`)

- Añadida separación estricta de privilegios por clave `kid` (`PublicKeyEntry` con `allowedLevels` y `custody`: `DEMO | HOT_WORKER_N4 | COLD_NIVEL2_N3`) en `src/lib/crypto-carnet.ts` y pruebas anti-escalación en `tests/integrity.test.mjs`.
- Reemplazado `public/robots.txt` por endpoint dinámico `src/pages/robots.txt.ts` ligado a `Astro.site`; centralizado `Astro.site` en `src/pages/sitemap.xml.ts` y `src/components/CarnetPreview.astro`, y añadida validación de `dist/robots.txt`, `dist/sitemap.xml` y `dist/CNAME` en `scripts/deploy.mjs`.
- Mejorado el lenguaje ciudadano en `src/pages/index.astro` (sustituyendo jerga técnica en portada) e incorporado `src/components/CompartirWhatsapp.astro` + descarga rápida del resumen PDF en portada, estructura, documentos y actas.
- Redactado `docs/BORRADOR_REGLAMENTO_Y_CHECKLIST_FUNDACIONAL.md` (incompatibilidades N1/N2, anti-bloqueo, cohortes escalables en Escuela Política, canal seguro N5 y checklist Ley N.° 28094) y actualizada `src/content/documentos/arquitectura-fase-2-seguridad.md` a **v1.1**.

## [2026-11-24] — Documentación integral y actualización arquitectónica pública (`a4180ed`)

- Actualizado `README.md` con el inventario completo de las 12 rutas compiladas, stack exacto, estructura de directorios y flujo soberano de despliegue.
- Creados `docs/ARQUITECTURA.md` (contratos de módulos `src/lib/*`, esquemas Zod, criptografía Ed25519 y componentes UI) y `docs/MANUAL_OPERATIVO.md` (guía práctica de operación para Nivel 2).
- Creado este archivo `CHANGELOG.md`.
- Actualizado el documento doctrinal público `src/content/documentos/arquitectura-transparencia-digital.md` a **v1.1** con las garantías técnicas implementadas en Fase 1 (protocolo `PU1`, rotación `kid`, QR por `#token=`, céntimos enteros, cero CDNs externos y reflow `320px`).

## [2026-11-24] — Corrección de reflow 320px–360px y código en prosa (`e21a588`)

- Corregido en `src/styles/global.css` el desborde horizontal del encabezado en viewports estrechos (`320px`–`382px`) acotando `white-space: nowrap` a `.site-header.is-wide .header-inner > *`, flexibilizando `.site-logo` y ocultando `.site-logo-sub` por debajo de `400px`.
- Añadidos `overflow-wrap: anywhere` en `.prose-doctrina code` y `overflow-x: auto` en `.prose-doctrina pre`.

## [2026-11-24] — Depuración lógica profunda y acoplamiento real (`1d3fbf2`)

- Validación cruzada en `src/lib/crypto-carnet.ts` (`id`/`nivel`, `tipo`/`-DEMO-`, `nivel 3 => escuelaCertificada`, fechas ISO reales vía `isValidIsoDate` y tolerancia a saltos de línea).
- Reconexión directa del script de `PanelTesoreria.astro` hacia `src/lib/tesoreria-metrics.ts` mediante atributos `data-*`, validación estricta de enteros en céntimos y unicidad de IDs.
- Añadidos `hashchange`, migración de `?token=` a `#token=` y guarda secuencial `verifySeq` en `VerificadorCarnet.astro`.
- Derivación en compilación de metadatos demo en `CarnetPreview.astro`, búsqueda insensible a tildes (`src/lib/search.ts`), refinamiento ISO real en `src/content.config.ts`, `noindex` en `404.astro` y estabilización de `ResizeObserver` en `SiteHeader.astro`.

## [2026-11-24] — Optimización multimedia y legibilidad (`752b058` / `b257cd4`)

- Auto-alojamiento completo de tipografías (`Libre Baskerville` y `Plus Jakarta Sans Variable`) con preloads locales y eliminación de cualquier CDN externo.
- Emblema SVG propio (`EmblemaSvg.astro`, `public/favicon.svg`), set iconográfico local (`Icon.astro`), ilustración vectorial coordinada (`EscuelaIlustracionSvg.astro`), tarjeta OpenGraph `1200x630` y optimización AVIF/WebP con `fallbackFormat="jpeg"`.
- Código QR SVG escaneable (`qrcode`, nivel `L`) en `CarnetPreview.astro` y ejes `sticky top-28` en `PiramideInteractiva.astro`.

## [2026-11-24] — Privacidad Ley N.° 29733, rotación `kid` y rutas de actas (`a2ef01d` / `c082e0a`)

- Añadida página `/privacidad/` y especificación técnica de Fase 2/3 (`arquitectura-fase-2-seguridad.md`).
- Implementadas rutas individuales `/transparencia/actas/[slug]/`, etiquetas móviles para `.pu-table-autoridades`, protección de `:popover-open` y limpieza idempotente de worktree/ramas en `scripts/deploy.mjs`.

## [2026-11-23] — Apertura del portal Fase 1 (`990823d`)

- Constitución inicial del sitio estático en Astro 7 + Tailwind CSS v4, libro contable real en `S/ 0.00`, organigrama estatutario de 3 poderes y 5 niveles, regla de Escuela Política (mínimo 6 meses sin atajos) y despliegue soberano a costo `$0.00` hacia `gh-pages` sin GitHub Actions.
