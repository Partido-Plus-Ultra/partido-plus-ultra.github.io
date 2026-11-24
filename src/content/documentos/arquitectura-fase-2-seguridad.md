---
titulo: "Especificación Técnica de Fase 2/3: Seguridad, Resiliencia y Gobernanza"
categoria: "Transparencia"
version: "1.0"
fecha: "2026-11-24"
organoEmisor: "Infraestructura Digital / Poder Constitucional"
resumen: "Arquitectura de seguridad para el registro anónimo Nivel 4 (Cloudflare Workers + D1), defensa anti-Sybil, rotación de llaves Ed25519 (kid), Escuela Política anti-fraude y checklist legal/estatutario."
---

## 1. Infraestructura Serverless Costo $0: Elección Técnica

Para pasar de un portal estático (Fase 1) a un sistema con inscripción anónima real y seguimiento de Escuela Política (Fases 2 y 3) sin gastos de servidor:

- **Elección recomendada: Cloudflare Workers + D1 (SQLite) + Turnstile.** No se suspende por inactividad y mantiene latencia baja en Perú.
- **Por qué se descarta Supabase Free para producción temprana:** Pausa automáticamente las bases de datos gratuitas tras **7 días consecutivos sin tráfico**, lo que dejaría caídos el registro y la Escuela Política en semanas de menor movimiento.

---

## 2. Seguridad del Registro Anónimo (Nivel 4)

1. **Defensa Anti-Sybil y Anti-Bots:** El endpoint de registro exigirá validación mediante **Cloudflare Turnstile**, limitación de tasa (*rate limiting*) por ventana temporal y controles anti-inflado para impedir que scripts externos generen miles de carnets falsos.
2. **Recuperación Explícita sin Exponer Identidad:** Al emitir un carnet `PU-N4`, el sistema entregará por única vez una frase/llave de recuperación descargable para que el militante no pierda su progreso en la Escuela Política si cambia o pierde su dispositivo.
3. **Protocolo `PU1` con Rotación de Llaves (`kid`):**
   - Cada credencial incluye el identificador de llave `kid` en su carga útil (`PU1.<payload>.<firma>`).
   - Esto permite al Poder Constitucional rotar periódicamente la clave privada Ed25519 sin invalidar los carnets vigentes emitidos con claves anteriores autorizadas.
4. **QR Seguro por Fragmento (`#token=`):** Los códigos QR de verificación apuntan a `/militancia/#token=...`. Al ir en el fragmento `#`, la credencial es leída únicamente por el navegador del verificador y jamás queda registrada en logs de servidores HTTP intermedios.

---

## 3. Resiliencia, Soberanía Digital y "Bus Factor > 1"

- **Gobernanza multi-firma en GitHub:** La organización `Partido-Plus-Ultra` deberá contar con al menos **2 a 3 administradores del Poder Constitucional (Nivel 2)** con autenticación de dos factores (2FA) obligatoria y protección de rama `main` mediante revisión cruzada antes de modificar `tesoreria.json` u `organigrama.json`.
- **Backups cifrados propios:** Toda base D1 de militancia y avances académicos debe exportarse periódicamente en copias cifradas custodiadas fuera de la nube por Secretaría General / Tesorería (Nivel 2).
- **Soberanía de dominio frente a *mass reporting*:** Se recomienda registrar un dominio propio institucional (ej. `.org` o `.pe`) apuntando al sitio estático, lo que permite migrar el portal entre GitHub Pages, Cloudflare Pages o Netlify en minutos ante eventuales bloqueos o reportes maliciosos.

---

## 4. Escuela Política: Modelo Híbrido Anti-Fraude (Nivel 4 → Nivel 3)

La plataforma digital controla el **registro auditable de trazabilidad** (reloj real mínimo de **6 meses sin atajos**, lecturas y evaluaciones base), pero **no certifica automáticamente** por cuestionarios en línea vulnerables a bots o IA generativa:

1. **Evaluación oral / sincrónica obligatoria** ante docentes autorizados del **Nivel 1 y Nivel 2**.
2. **Verificación previa de idoneidad y antecedentes** (penales, judiciales y policiales) antes de emitir la certificación oficial de ingreso a la **Asamblea Dirigencial / Cantera (Nivel 3)**.

---

## 5. Checklist Jurídico y Reglamentario Pendiente (Nivel 2)

Antes de iniciar trámites de inscripción electoral o captar aportes financieros reales, el Poder Constitucional deberá aprobar reglamentos complementarios sobre:

1. **Ley N.° 28094 (ROP / JNE):** Equivalencia estatutaria de El Triunvirato y Poder Constitucional con los órganos obligatorios (Personero Legal, Tesorería Titular/Suplente, Órgano Electoral Central), comités provinciales físicos y padrón legal con DNI/firma RENIEC.
2. **ONPE y Ley N.° 29733 (ANPD):** Formatos compatibles de rendición financiera bancarizada, política de consentimiento para flujo transfronterizo e inscripción de bancos de datos personales cuando se recopilen datos identificables.
3. **Reglas anti-bloqueo interno (*deadlocks*):** Procedimiento y quórum de reemplazo por vacancia/renuncia/falta grave en Nivel 1 o Nivel 2, mecanismo de desempate entre poderes y precisión reglamentaria sobre la incompatibilidad económica ("no tener empresas") y declaraciones juradas patrimoniales públicas de entrada y salida.
