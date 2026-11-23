---
titulo: "Arquitectura de Transparencia Digital y Criptografía de Carnets"
categoria: "Transparencia"
version: "1.0"
fecha: "2026-11-23"
organoEmisor: "Infraestructura Digital / Poder Constitucional"
resumen: "Define cómo el Partido Plus Ultra garantiza auditoría pública gratuita mediante Git-as-a-Ledger, anonimato de Nivel 4 con firmas Ed25519 y desacoplamiento legal ante el ROP/JNE."
---

## 1. Principio de Transparencia Total a Costo Cero

La infraestructura pública del **Partido Plus Ultra** reside en un repositorio público auditado por cualquier ciudadano:

- **Código fuente abierto:** Todo ciudadano puede inspeccionar cómo se calculan los balances financieros, las reglas estatutarias y la verificación de carnets.
- **Git-as-a-Ledger:** Los libros de tesorería (`src/data/tesoreria.json`), organigrama (`src/data/organigrama.json`) y actas (`src/content/actas/`) quedan registrados en historial inmutable de commits con fecha, autor y diff verificable.
- **Sostenibilidad sin gasto de recursos públicos:** Alojado de forma estática en GitHub Pages (`$0.00`), sin servidores costosos ni dependencias privadas opacas.

## 2. Privacidad y Anonimato en Nivel 4

El software distingue estrictamente entre **militancia operativa anónima (Nivel 4)** y **cantera dirigencial/electoral (Nivel 3)**:

1. **Cero datos personales (PII) en el repositorio público:** Jamás se publican nombres reales de militantes de Nivel 4, números de DNI, direcciones ni teléfonos en GitHub.
2. **Verificación criptográfica sin padrón expuesto:** En lugar de publicar una lista con todos los carnets emitidos (lo que permitiría contar o enumerar miembros), los carnets digitales utilizan firma asimétrica **Ed25519**.
3. **Verificación offline/estática:** Cualquier ciudadano o coordinador puede verificar si un token de carnet es auténtico y no figura revocado comparándolo contra la clave pública oficial del partido y la lista anónima de revocaciones.

## 3. Desacoplamiento para Requisitos Legales (JNE / ROP)

Cuando un miembro del Nivel 4 aprueba los **6 meses obligatorios de la Escuela Política** y se certifica para ingresar al **Nivel 3 (Asamblea Dirigencial / Cantera)** o cuando el partido realice trámites oficiales de inscripción ante el Registro de Organizaciones Políticas (ROP) del JNE, la validación de identidad legal se gestionará por separado bajo custodia del Poder Constitucional (Nivel 2), fuera del sitio estático público.
