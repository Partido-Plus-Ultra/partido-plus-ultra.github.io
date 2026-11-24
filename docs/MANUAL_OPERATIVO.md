# Manual Operativo de Publicación — Partido Plus Ultra

Guía paso a paso para que los responsables designados del **Poder Constitucional (Nivel 2)** —Secretaría General, Tesorería e Infraestructura Digital— mantengan actualizado el portal público sin romper la integridad ni exponer datos privados.

---

## 1. Requisitos previos en el equipo local

- Node.js moderno (probado en `v26.12.1`) y `npm`
- Git configurado con acceso al remoto `origin` (`https://github.com/Partido-Plus-Ultra/partido-plus-ultra.github.io.git`)
- Instalación inicial de dependencias (una sola vez o al cambiar `package.json`):

```bash
npm install
```

---

## 2. Reglas de Seguridad Obligatorias (Antes de Editar)

1. **Nunca subir datos personales (PII) de Nivel 4 ni archivos de `_privado/`:** ningún DNI, teléfono, correo o padrón nominal de militantes operativos puede entrar al repositorio público.
2. **Nunca crear archivos en `.github/workflows/`:** los despliegues e integraciones se ejecutan exclusivamente en local a costo `$0.00`. `scripts/deploy.mjs` y `tests/integrity.test.mjs` abortan cualquier ejecución si detectan esa carpeta.
3. **Nunca agregar fuentes ni scripts desde CDNs externos** en `src/`.
4. **Usar fechas reales en formato `YYYY-MM-DD`:** el compilador y las pruebas rechazan fechas inexistentes en calendario (como `2026-02-31`).

---

## 3. Cómo registrar movimientos en Tesorería (`src/data/tesoreria.json`)

Todo monto se registra en **céntimos enteros** (`1 sol = 100 céntimos`, ej. `S/ 150.50` -> `15050`).

```json
{
  "ejercicio": "2026",
  "moneda": "PEN",
  "simbolo": "S/",
  "saldoInicialCentimos": 0,
  "ultimaActualizacion": "2026-11-24",
  "responsable": "Tesorería — Poder Constitucional (Nivel 2)",
  "movimientos": [
    {
      "id": "MOV-2026-001",
      "fecha": "2026-11-24",
      "tipo": "ingreso",
      "categoria": "Aportes de fundadores",
      "concepto": "Aporte inicial bancarizado para trámites de constitución",
      "montoCentimos": 50000,
      "comprobanteRef": "OP-BCP-000123"
    }
  ]
}
```

Campos obligatorios por movimiento:
- `id`: cadena única en todo el arreglo.
- `fecha`: `YYYY-MM-DD` real.
- `tipo`: `"ingreso"` o `"egreso"`.
- `categoria`: texto breve (sirve para agrupar en filtros).
- `concepto`: descripción clara del movimiento.
- `montoCentimos`: entero `>= 0` (nunca decimales).
- `comprobanteRef` (opcional): referencia bancaria o de comprobante.

---

## 4. Cómo publicar una nueva Acta (`src/content/actas/*.md`)

Crear un archivo en `src/content/actas/`, por ejemplo `2026-12-01-acta-002-instalacion-tribunal.md`:

```markdown
---
numero: "002-2026"
titulo: "Título oficial del acta"
fecha: "2026-12-01"
organo: "Poder Constitucional (Nivel 2)"
resumen: "Síntesis ejecutiva pública de los acuerdos."
estado: "Publicada"
---

## Acuerdos aprobados

1. Detalle del primer acuerdo...
```

Valores permitidos por el esquema Zod en `src/content.config.ts`:
- `organo`: `"Triunvirato (Nivel 1)"`, `"Poder Constitucional (Nivel 2)"`, `"Asamblea Dirigencial (Nivel 3)"`, `"Infraestructura Digital"`.
- `estado`: `"Publicada"`, `"En constitución"`.

Al compilar, Astro generará automáticamente su página dedicada `/transparencia/actas/<nombre-archivo>/`, la listará en `/transparencia/` y la incluirá en `/sitemap.xml`.

---

## 5. Cómo publicar un Documento Doctrinal o Técnico (`src/content/documentos/*.md`)

Crear un archivo `.md` en `src/content/documentos/`:

```markdown
---
titulo: "Título del reglamento o documento"
categoria: "Reglamento"
version: "1.0"
fecha: "2026-12-01"
organoEmisor: "Poder Constitucional (Nivel 2)"
resumen: "Resumen breve para la Biblioteca Doctrinal."
pdfUrl: "/documentos/mi-archivo.pdf"
---
```

Valores permitidos para `categoria`: `"Estructura"`, `"Doctrina"`, `"Reglamento"`, `"Transparencia"`. El campo `pdfUrl` es opcional (si se usa, colocar el PDF en `public/documentos/`).

---

## 6. Cómo actualizar Autoridades y Revocaciones

- **Autoridades (`src/data/organigrama.json` -> `registroAutoridades`):** mantener actualizados `titular`, `estado` y `declaracionNoEmpresas` cuando existan actas de nombramiento vigentes. Respetar la regla estatutaria de 3 plazas en Nivel 1 e impar entre 5 y 13 en Nivel 2.
- **Revocación anónima de carnets (`src/data/revocaciones.json`):** añadir únicamente el identificador público (ej. `"PU-N4-XXXX-YYYY"`) al arreglo `revocados` y actualizar `ultimaActualizacion` (`YYYY-MM-DD`), sin incluir nombres ni datos personales.

---

## 7. Alta y rotación de llaves Ed25519 oficiales (Fase 2)

En `src/lib/crypto-carnet.ts`:
1. Conservar las claves anteriores autorizadas dentro de `OFFICIAL_PUBLIC_KEYS` indexadas por su `kid` (ej. `"pu-oficial-2027-01"`) para que los carnets vigentes emitidos previamente sigan validando sin cortes.
2. Añadir la nueva clave pública en formato JWK (`kty: "OKP"`, `crv: "Ed25519"`, `alg: "Ed25519"`, `key_ops: ["verify"]`).
3. **Jamás** incluir la clave privada (`d` en JWK) en este archivo ni en el repositorio público.

---

## 8. Flujo de Validación, Commit y Despliegue a Producción

Después de editar datos o documentación:

```bash
# 1. Verificar tipos, esquema de datos, pruebas unitarias y compilación estática
npm run check
npm test
npm run build

# 2. Confirmar cambios en main y subirlos al remoto
git status
git add .
git commit -m "docs/data: descripción breve del cambio"
git push origin main

# 3. Publicar el sitio compilado en la rama gh-pages (costo $0.00)
npm run deploy
```

En Windows, el paso 3 también puede ejecutarse con doble clic o desde consola mediante `scripts\deploy.bat`. Una vez finalizada la publicación, GitHub Pages actualiza `https://partido-plus-ultra.github.io/` en aproximadamente 15–30 segundos.
