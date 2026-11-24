---
titulo: "Arquitectura de Transparencia Digital y Criptografía de Carnets"
categoria: "Transparencia"
version: "1.1"
fecha: "2026-11-24"
organoEmisor: "Infraestructura Digital / Poder Constitucional"
resumen: "Define cómo el Partido Plus Ultra garantiza auditoría pública gratuita mediante Git-as-a-Ledger, anonimato de Nivel 4 con firmas Ed25519 (protocolo PU1 y rotación kid), contabilidad exacta en céntimos y desacoplamiento legal ante el ROP/JNE."
---

## 1. Principio de Transparencia Total a Costo Cero

La infraestructura pública del **Partido Plus Ultra** reside en un repositorio público auditado por cualquier ciudadano:

- **Código fuente abierto:** Todo ciudadano puede inspeccionar en `Partido-Plus-Ultra/partido-plus-ultra.github.io` cómo se calculan los balances financieros, las reglas estatutarias y la verificación de carnets.
- **Git-as-a-Ledger:** Los libros de tesorería (`src/data/tesoreria.json`), organigrama (`src/data/organigrama.json`), revocaciones (`src/data/revocaciones.json`) y actas (`src/content/actas/`) quedan registrados en historial inmutable de commits con fecha, autor y diff verificable.
- **Contabilidad en céntimos enteros y CSV seguro:** Los saldos y movimientos se almacenan exclusivamente como enteros en céntimos para evitar errores de redondeo, se validan fechas reales de calendario e identificadores únicos, y la exportación CSV neutraliza fórmulas potencialmente maliciosas.
- **Soberanía sin gasto ni workflows de pago:** Compilación estática en Astro alojada en GitHub Pages (`S/ 0.00`), sin servidores costosos ni workflows automatizados en la nube que generen facturación.

## 2. Privacidad y Anonimato en Nivel 4 (Ley N.° 29733)

El software distingue estrictamente entre **militancia operativa anónima (Nivel 4)** y **cantera dirigencial/electoral (Nivel 3)**:

1. **Cero datos personales (PII) en el repositorio público:** Jamás se publican nombres reales de militantes de Nivel 4, números de DNI, direcciones ni teléfonos en GitHub. Todo material fundacional privado original permanece fuera del control de versiones público.
2. **Protocolo `PU1` con firma Ed25519 y rotación por `kid`:** En lugar de publicar un padrón con todos los carnets emitidos (lo que permitiría enumerar o perfilar miembros), cada credencial adopta el formato `PU1.<payload>.<firma>` con identificador de clave `kid`, permitiendo rotar llaves oficiales en Fase 2 sin invalidar carnets vigentes.
3. **Verificación offline en navegador con transporte por `#token=`:** El verificador valida en Web Crypto API la firma asimétrica **Ed25519**, la coherencia interna de rango y certificación de Escuela Política, y la lista anónima de revocaciones. Los enlaces QR transportan la credencial en el fragmento `#token=` para que jamás quede registrada en logs HTTP de servidores intermedios.
4. **Cero rastreo ni CDNs externos:** Las tipografías, iconos e ilustraciones se sirven auto-alojados desde el propio sitio estático, evitando llamadas de terceros o perfiles de navegación hacia CDNs externos.

## 3. Desacoplamiento para Requisitos Legales (JNE / ROP) y Accesibilidad

- **Separación legal ROP/JNE:** Cuando un miembro del Nivel 4 aprueba los **6 meses obligatorios de la Escuela Política** (bajo modelo híbrido presencial/sincrónico y evaluación de idoneidad ante docentes de Nivel 1 y Nivel 2) y se certifica para ingresar al **Nivel 3 (Asamblea Dirigencial / Cantera)**, o cuando el partido realice trámites oficiales ante el Registro de Organizaciones Políticas (ROP) del JNE, la validación de identidad legal se gestionará por separado bajo custodia del Poder Constitucional (Nivel 2), fuera del sitio estático público.
- **Accesibilidad cívica universal:** Todas las rutas cumplen diseño adaptable sin desborde horizontal desde `320px` de ancho, contraste WCAG AA y soporte completo para navegación por teclado y lectores de pantalla.
