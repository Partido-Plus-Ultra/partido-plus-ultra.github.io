# Partido Plus Ultra — Infraestructura Digital y Portal de Transparencia

Repositorio público oficial del **Partido Plus Ultra (PU)** en el Perú. Implementa la **Fase 1** de la infraestructura digital abierta del partido con **costo operativo S/ 0.00 / $0.00**, publicada como sitio estático en GitHub Pages:

- **Portal en vivo:** https://partido-plus-ultra.github.io/
- **Repositorio fuente (`main`) y compilado (`gh-pages`):** https://github.com/Partido-Plus-Ultra/partido-plus-ultra.github.io

> Este es actualmente el único repositorio oficial en la organización `Partido-Plus-Ultra`. Las carpetas privadas con material fundacional original (`_privado/`, `*.ogg`) están excluidas por `.gitignore` y jamás se suben al repositorio público.

---

## Principios del Sistema

1. **Transparencia como Código (`Git-as-a-Ledger`):**
   - El libro contable en céntimos enteros (`src/data/tesoreria.json`), la estructura orgánica y registro de autoridades (`src/data/organigrama.json`), las revocaciones (`src/data/revocaciones.json`), los documentos doctrinales (`src/content/documentos/`) y las actas oficiales (`src/content/actas/`) residen en `main` con historial auditable de Git.
2. **Regla Orgánica de Tres Poderes y Cinco Niveles:**
   - **Nivel 5 — Afiliados y Simpatizantes:** Apoyo social, firma y difusión; sin obligaciones orgánicas fijas.
   - **Nivel 4 — Militancia Operativa:** Ingreso digital con carnet anónimo `PU-N4` y permanencia opcional indefinida (sin obligación de postular a cargos públicos).
   - **Nivel 3 — Asamblea Dirigencial / La Cantera (Poder Legislativo):** Único escalón habilitado como cantera electoral. Exige aprobar obligatoriamente la **Escuela Política (mínimo 6 meses, sin atajos ni exoneraciones)** dictada exclusivamente por docentes de Nivel 1 y Nivel 2.
   - **Nivel 2 — Poder Constitucional:** Inicia con 5 integrantes y crece en número impar (`5, 7, 9, 11, 13`) con rotación escalonada cada 2 años; alberga Secretaría General (4 años), Tesorería (4 años) y Supervisores. **Prohibición absoluta de postular a cargos públicos y de tener empresas.**
   - **Nivel 1 — El Triunvirato (Poder Ejecutivo):** 1 Líder Principal (8 años) y 2 Copresidentes (4 años). **Prohibición absoluta de postular a cargos públicos y de tener empresas.**
3. **Privacidad por Diseño (Ley N.° 29733) y Criptografía Ed25519:**
   - Cero datos personales (PII), DNI o teléfonos de militantes de Nivel 4 en el repositorio público.
   - Verificación estática en navegador con Web Crypto **Ed25519**, protocolo `PU1.<payload>.<firma>`, rotación de claves por `kid` y transporte QR mediante fragmento privado `#token=...` (nunca en query strings enviados al servidor).
4. **Soberanía de Despliegue y Cero CDNs Externos:**
   - Cero dependencias de fuentes o scripts de terceros (tipografías `@fontsource` auto-alojadas, iconos SVG locales, imágenes optimizadas en compilación con `<Picture formats={['avif', 'webp']} fallbackFormat="jpeg">`).
   - Prohibición estricta de workflows de GitHub Actions (`.github/workflows/*.yml`). Todas las verificaciones, builds y despliegues corren localmente (`scripts/deploy.mjs` / `scripts/deploy.bat`) hacia la rama `gh-pages`.
5. **Accesibilidad Universal:**
   - Contraste WCAG AA, navegación por teclado y lectores de pantalla, y cumplimiento de reflow desde `320px` de ancho sin scroll horizontal en todas las rutas.

---

## Rutas Públicas Compiladas (12 páginas + `sitemap.xml`)

| Ruta | Contenido y función principal |
| :--- | :--- |
| `/` | Portada institucional, síntesis de valores, ejes y acceso a módulos públicos. |
| `/estructura/` | Pirámide interactiva de 5 niveles, 3 poderes, plan fundacional (15 + 50) y tabla de autoridades. |
| `/transparencia/` | Panel de tesorería en vivo (céntimos enteros, filtro sin tildes, exportación CSV segura) y actas. |
| `/transparencia/actas/[slug]/` | Vista íntegra de cada acta oficial con enlace directo de auditoría al Markdown fuente en GitHub. |
| `/biblioteca/` | Repositorio doctrinal buscable sin sensibilidad a tildes y filtrable por categoría. |
| `/biblioteca/[slug]/` | Lectura completa de cada documento doctrinal/técnico (`estructura-basica-v2`, transparencia, Fase 2). |
| `/militancia/` | Emisión conceptual de Carnet Digital Nivel 4, vista previa con QR real y verificador Ed25519 en vivo. |
| `/escuela-politica/` | Regla de permanencia de 6 meses sin atajos, modelo híbrido anti-fraude y ruta hacia Nivel 3. |
| `/privacidad/` | Política de privacidad, anonimato Nivel 4 y adecuación a la Ley N.° 29733. |
| `/404.html` | Página de error con `noindex, nofollow` para GitHub Pages. |
| `/sitemap.xml` | Mapa de sitio dinámico generado en compilación (`src/pages/sitemap.xml.ts`). |
| `/robots.txt` | Reglas de rastreo generadas dinámicamente según `Astro.site` (`src/pages/robots.txt.ts`). |

---

## Stack Técnico

- **Framework:** `astro@^7.4.13` (salida 100% estática, `trailingSlash: 'always'`)
- **Estilos:** `tailwindcss@^4.3.5` mediante `@tailwindcss/vite`
- **Lenguaje:** `typescript@^5.9.3` (`astro/tsconfigs/strict`) y validación Zod (`astro:content`)
- **Tipografías auto-alojadas:** `@fontsource/libre-baskerville` (`400`, `700`) y `@fontsource-variable/plus-jakarta-sans`
- **Criptografía y QR:** Web Crypto API (`Ed25519`) + `qrcode@^1.5.4`
- **Compatibilidad UI:** `@oddbird/popover-polyfill@^0.4.2` (carga condicional)

---

## Estructura del Proyecto

```text
├── docs/
│   ├── ARQUITECTURA.md                                  # Referencia técnica detallada
│   ├── MANUAL_OPERATIVO.md                              # Guía práctica para publicar actas, cuentas y claves
│   └── BORRADOR_REGLAMENTO_Y_CHECKLIST_FUNDACIONAL.md   # Borrador de trabajo N1/N2, deadlocks y ROP
├── public/
│   ├── .nojekyll                                        # Desactiva Jekyll en GitHub Pages
│   ├── favicon.svg                                      # Emblema PU vectorial
│   ├── documentos/estructura-basica-v2.pdf
│   └── img/                                             # Infografía y tarjeta OpenGraph 1200x630
├── scripts/
│   ├── deploy.mjs                     # Validación + build + push atómico a gh-pages
│   └── deploy.bat                     # Lanzador Windows del despliegue local
├── src/
│   ├── assets/img/                    # Imágenes fuente .webp optimizadas en AVIF/WebP/JPEG
│   ├── components/                    # Componentes Astro y scripts cliente encapsulados
│   ├── content/
│   │   ├── actas/                     # Actas oficiales en Markdown
│   │   └── documentos/                # Documentos doctrinales y especificaciones técnicas
│   ├── data/                          # Ledgers JSON (organigrama, tesoreria, revocaciones)
│   ├── layouts/BaseLayout.astro       # Layout maestro, SEO, OpenGraph y preloads locales
│   ├── lib/                           # Módulos TypeScript puros compartidos con Node test runner
│   ├── pages/                         # Rutas estáticas y sitemap.xml.ts
│   ├── styles/global.css              # Design tokens, navbar, tablas, acordeón y prosa
│   └── content.config.ts              # Esquemas Zod de colecciones
├── tests/integrity.test.mjs           # Suite de 5 pruebas unitarias e integridad normativa
├── CHANGELOG.md                       # Historial técnico de versiones
└── README.md                          # Este documento
```

---

## Comandos Locales

```bash
npm install      # Instala dependencias en un entorno Node moderno
npm run dev      # Servidor de desarrollo Astro en localhost:4321
npm run check    # Diagnóstico estático Astro + TypeScript + esquemas Zod
npm test         # Ejecuta las 5 suites de node --test tests/integrity.test.mjs
npm run build    # Genera la compilación estática final en dist/
npm run deploy   # Ejecuta check + test + build y publica dist/ en origin/gh-pages
```

En Windows también puede ejecutarse directamente `scripts\deploy.bat`. Para publicar teniendo cambios locales intencionales sin confirmar (solo pruebas locales), `node scripts/deploy.mjs --allow-dirty`.

---

## Documentación Ampliada

- [Arquitectura Técnica (`docs/ARQUITECTURA.md`)](docs/ARQUITECTURA.md)
- [Manual Operativo de Publicación (`docs/MANUAL_OPERATIVO.md`)](docs/MANUAL_OPERATIVO.md)
- [Borrador de Reglamento y Checklist Fundacional (`docs/BORRADOR_REGLAMENTO_Y_CHECKLIST_FUNDACIONAL.md`)](docs/BORRADOR_REGLAMENTO_Y_CHECKLIST_FUNDACIONAL.md)
- [Registro de Cambios (`CHANGELOG.md`)](CHANGELOG.md)
- Documentos públicos en el portal:
  - [Estructura Básica del Partido v2](src/content/documentos/estructura-basica-v2.md)
  - [Arquitectura de Transparencia Digital v1.1](src/content/documentos/arquitectura-transparencia-digital.md)
  - [Especificación Técnica de Fase 2/3: Seguridad, Resiliencia y Gobernanza v1.1](src/content/documentos/arquitectura-fase-2-seguridad.md)
