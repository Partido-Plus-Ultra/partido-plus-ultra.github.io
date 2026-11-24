# Arquitectura Técnica del Portal — Partido Plus Ultra

Documento técnico de referencia sobre el diseño, módulos, contratos de datos, seguridad criptográfica y flujo de compilación del portal en **Fase 1**.

---

## 1. Principios de Ingeniería y Configuración

- **Compilación estática pura (`astro.config.mjs`):**
  - `site: 'https://partido-plus-ultra.github.io'`
  - `base: '/'`
  - `trailingSlash: 'always'`
  - Integración CSS vía `@tailwindcss/vite` (Tailwind CSS v4) con tokens en `@theme` y variables `:root` dentro de `src/styles/global.css`.
- **Resolución uniforme de rutas (`src/lib/url.ts`):**
  - Exporta `SITE_URL`, `REPO_URL` y `withBase(path)` para respetar `import.meta.env.BASE_URL` en enlaces internos y URLs canónicas sin romper URLs externas (`http:`, `https:`, `mailto:`, `tel:`, `#`).
- **Cero llamadas a servicios de terceros en tiempo de ejecución:**
  - Las tipografías (`Libre Baskerville` 400/700 y `Plus Jakarta Sans Variable`) provienen de paquetes `@fontsource/*` y se precargan mediante importaciones `?url` con atributo `crossorigin` en `src/layouts/BaseLayout.astro`.
  - Las imágenes en `src/assets/img/` (`hero-amanecer-civico.webp` y `visual-transparencia.webp`) se procesan en compilación usando `<Picture formats={['avif', 'webp']} fallbackFormat="jpeg">` para evitar fallbacks PNG pesados.

---

## 2. Módulos de Lógica Pura (`src/lib/`)

Todos los módulos en `src/lib/` usan TypeScript estricto compartido tanto por el navegador/Astro como por la suite de pruebas en Node (`tests/integrity.test.mjs`).

### 2.1 Búsqueda y Calendario (`src/lib/search.ts`)
- `normalizeSearchText(value)`: normaliza texto mediante NFD, elimina diacríticos Unicode (`[\u0300-\u036f]`), convierte a minúsculas y recorta espacios. Garantiza búsquedas insensibles a tildes en Biblioteca y Tesorería.
- `isValidIsoDate(value)`: valida sintaxis `YYYY-MM-DD` **y existencia real en calendario UTC** (rechaza fechas imposibles como `2026-02-31` o `2025-02-29` mientras acepta años bisiestos reales como `2024-02-29`).

### 2.2 Métricas Contables y Exportación (`src/lib/tesoreria-metrics.ts`)
- **Representación exacta en céntimos:** toda cifra monetaria (`saldoInicialCentimos`, `montoCentimos`, totales calculados) es un número entero para evitar errores de punto flotante.
- `calcularResumen(libro)`: valida que `saldoInicialCentimos` y cada `montoCentimos` sean enteros válidos (`>= 0` en movimientos), exige `id` único no vacío y valida todas las fechas con `isValidIsoDate`.
- `filtrarMovimientos(movimientos, filtro)`: filtra por `tipo`, `categoria` y búsqueda textual normalizada sobre `id`, `concepto`, `categoria` y `comprobanteRef`.
- `formatearMoneda(centimos, simbolo = 'S/')`: formatea importes con separador local `es-PE` y exactamente dos decimales.
- `exportarCsvSeguro(movimientos, simbolo = 'S/')`: genera CSV compatible (`\r\n`, comillas escapadas) y neutraliza la inyección de fórmulas en hojas de cálculo anteponiendo apóstrofe (`'`) a celdas que inicien con `=`, `+`, `-`, `@`, `\t` o `\r`.

### 2.3 Verificador Criptográfico de Carnets (`src/lib/crypto-carnet.ts`)
- **Formato del token:** `PU1.<payloadBase64Url>.<firmaBase64Url>`.
- **Normalización de entrada:** `verifyCarnetToken(rawToken, revokedIds)` elimina todos los espacios y saltos de línea internos (`\s+`) antes de separar los segmentos, permitiendo pegar credenciales copiadas desde WhatsApp o PDF con saltos de línea.
- **Validación estructural estricta (`isValidPayload`):**
  - `id`: patrón `^PU-N[34]-(?:DEMO|[A-Z0-9]{4})-[A-Z0-9]{4}$`.
  - Coherencia de rango: `id` debe empezar exactamente por `PU-N${nivel}-`.
  - Coherencia de tipo: si `tipo === 'DEMO'`, `id` debe contener `-DEMO-`; si `tipo === 'OFICIAL'`, no puede contener `-DEMO-`.
  - Coherencia académica: si `nivel === 3`, `escuelaCertificada` debe ser `true`.
  - `kid`: patrón `^[a-z0-9-]+$` e indexación separada en `DEMO_PUBLIC_KEYS` (incluye `demo-2026-01`) u `OFFICIAL_PUBLIC_KEYS` (reservada para Fase 2).
  - `emitido`: fecha calendario real validada con `isValidIsoDate`.
- **Verificación Ed25519 y Revocación:**
  - Importa la clave pública JWK (`OKP` / `Ed25519`) mediante `crypto.subtle.importKey` y verifica la firma sobre los bytes UTF-8 del segmento `payloadB64`.
  - Si la firma es válida pero `payload.id` está listado en `src/data/revocaciones.json`, devuelve `status: 'revoked'`.
  - Si Web Crypto o Ed25519 no están disponibles en el navegador, devuelve `status: 'unsupported'` con mensaje degradado explícito.

---

## 3. Esquemas de Contenido y Datos (`src/content.config.ts` y `src/data/`)

- **Colección `documentos` (`src/content/documentos/*.md`):**
  - Campos requeridos: `titulo`, `categoria` (`Estructura | Doctrina | Reglamento | Transparencia`), `version`, `fecha` (validada con `isValidIsoDate`), `organoEmisor`, `resumen` y opcionalmente `pdfUrl`.
- **Colección `actas` (`src/content/actas/*.md`):**
  - Campos requeridos: `numero`, `titulo`, `fecha` (validada con `isValidIsoDate`), `organo` (`Triunvirato (Nivel 1) | Poder Constitucional (Nivel 2) | Asamblea Dirigencial (Nivel 3) | Infraestructura Digital`), `resumen`, `estado` (`Publicada | En constitución`).
- **Ledgers JSON (`src/data/`):**
  - `organigrama.json`: define poderes, niveles, reglas, distribución inicial de `15` fundadores + `50` simpatizantes y `registroAutoridades`.
  - `tesoreria.json`: libro contable anual inicializado en `saldoInicialCentimos: 0`, `movimientos: []`.
  - `revocaciones.json`: catálogo público anónimo de identificadores `PU-N*` revocados.

---

## 4. Arquitectura de Componentes e Interfaz

- **`SiteHeader.astro` + `src/styles/global.css`:**
  - Navegación adaptable basada en medición real de contenido con `ResizeObserver` y `document.fonts.ready` (clase `.is-wide`).
  - En estado colapsado usa API nativa `popover="auto"` con polyfill condicional (`@oddbird/popover-polyfill`), protegiendo `:popover-open` mediante comprobación segura para navegadores antiguos y evitando bucles de medición cuando el popover móvil está abierto.
  - Compactación por debajo de `400px` (`@media (max-width: 399px)`) ocultando `.site-logo-sub` y usando tamaños fluidos (`clamp`) para garantizar `0px` de desborde horizontal en `320px` (WCAG 1.4.10 Reflow).
- **`PanelTesoreria.astro`:**
  - Carga datos serializados en `data-*` y los procesa mediante `<script>` empaquetado que importa directamente `tesoreria-metrics.ts` (sin duplicar lógica en JS inline).
- **`CarnetPreview.astro` y `VerificadorCarnet.astro`:**
  - `CarnetPreview` verifica `DEMO_SAMPLE_TOKEN` en tiempo de compilación, extrae sus campos reales y genera el `<svg>` QR con `errorCorrectionLevel: 'L'` apuntando a `${SITE_URL}/militancia/#token=...`.
  - `VerificadorCarnet` escucha `hashchange` para verificación instantánea sin recargar página, migra `?token=` a `#token=` con `history.replaceState` si llega por query string y utiliza un contador secuencial (`verifySeq`) para descartar resultados asincrónicos obsoletos.
- **`PiramideInteractiva.astro` y tablas responsivas:**
  - Pirámide escalonada en `>= 1024px` con ejes laterales `sticky top-28` y selector interactivo de niveles.
  - Tablas `.pu-table` convertibles a tarjetas en `@container (width < 600px)` con etiquetas `::before` para Tesorería y Registro de Autoridades, y `.prose-doctrina table` con desplazamiento horizontal contenido (`overflow-x: auto`).

---

## 5. Flujo de Despliegue Soberano ($0.00)

`scripts/deploy.mjs`:
1. Comprueba que **no existe** `.github/workflows` (política anti-billing).
2. Verifica que `origin` existe y que el árbol Git está limpio (a menos que se pase `--allow-dirty`).
3. Ejecuta secuencialmente `npm run check`, `npm test` y `npm run build`.
4. Valida la presencia de `dist/index.html` y `dist/.nojekyll`.
5. Crea un `git worktree` temporal en `os.tmpdir()`, abre una rama huérfana única `gh-pages-deploy-<timestamp>`, copia `dist/`, confirma y publica con `--force` en `origin/gh-pages`.
6. Garantiza en bloque `finally` la eliminación del worktree, del directorio temporal y de la rama temporal local.
