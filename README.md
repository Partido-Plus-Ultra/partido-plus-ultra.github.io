# Partido Plus Ultra — Infraestructura Digital y Portal de Transparencia

Repositorio público oficial del **Partido Plus Ultra (PU)** en Perú. Este proyecto materializa la infraestructura digital abierta del partido a **costo operativo S/ 0.00**, publicada en GitHub Pages:

- Sitio web: **https://partido-plus-ultra.github.io/**

## Principios del Sistema

1. **Transparencia como Código (`Git-as-a-Ledger`):**
   - El libro de tesorería (`src/data/tesoreria.json`), la estructura orgánica (`src/data/organigrama.json`), las revocaciones (`src/data/revocaciones.json`) y las actas (`src/content/actas/`) viven en este repositorio público bajo historial inmutable de Git.
2. **Regla Orgánica de Niveles:**
   - **Nivel 5:** Simpatizantes y apoyo social.
   - **Nivel 4 (Militancia Operativa):** Ingreso con carnet digital (`PU-N4`) sin obligación de postular a cargos públicos.
   - **Nivel 3 (Asamblea Dirigencial / Cantera):** Requiere aprobar obligatoriamente la **Escuela Política (mín. 6 meses, sin atajos)** dictada exclusivamente por Nivel 1 y Nivel 2. Única cantera electoral.
   - **Nivel 2 (Poder Constitucional)** y **Nivel 1 (El Triunvirato):** Prohibición absoluta de postular a cargos públicos y de tener empresas.
3. **Privacidad y Anonimato:**
   - Jamás se almacenan datos personales (PII), DNI ni teléfonos de militantes de Nivel 4 en este repositorio público.
   - La verificación de carnets utiliza firma asimétrica **Ed25519** vía Web Crypto API.
4. **Soberanía de Despliegue (Costo $0.00):**
   - Sin `.github/workflows` de GitHub Actions. Toda compilación y prueba corre localmente y publica `dist/` a la rama `gh-pages`.

## Comandos Locales

```bash
npm install
npm run dev      # Servidor local de desarrollo
npm run check    # Verificación de tipos Astro y esquemas Zod
npm test         # Suite de integridad (tesorería, organigrama, Ed25519, privacidad)
npm run build    # Compilación estática en dist/
npm run deploy   # Validación completa + build + publicación local en rama gh-pages
```
