# Registro de Cambios (CHANGELOG)

Todos los hitos relevantes del repositorio `Partido-Plus-Ultra/partido-plus-ultra.github.io` y su publicación en `https://partido-plus-ultra.github.io/`.

---

## [2026-11-24] — Documentación integral y actualización arquitectónica pública

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
