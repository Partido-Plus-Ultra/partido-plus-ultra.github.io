import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  calcularResumen,
  exportarCsvSeguro,
  filtrarMovimientos,
} from '../src/lib/tesoreria-metrics.ts';
import { DEMO_SAMPLE_TOKEN, verifyCarnetToken } from '../src/lib/crypto-carnet.ts';
import { isValidIsoDate, normalizeSearchText } from '../src/lib/search.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const organigrama = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'src', 'data', 'organigrama.json'), 'utf8')
);
const tesoreria = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'src', 'data', 'tesoreria.json'), 'utf8')
);

const BAD_KID_TOKEN =
  'PU1.eyJpZCI6IlBVLU40LURFTU8tN0s5UCIsImtpZCI6ImRlbW8taW5leGlzdGVudGUtOTkiLCJuaXZlbCI6NCwiZW1pdGlkbyI6IjIwMjYtMTEtMjMiLCJ0aXBvIjoiREVNTyIsImVzY3VlbGFDZXJ0aWZpY2FkYSI6ZmFsc2V9.Q-t4PyE0ItHy_ZI_XSUo-L38PO0R-UItzuMWyOfC_XZGZ-58jgQHA4lT9L13sArRroJAyOkGtKaap8nZNIGrDg';

const b64u = (v) => Buffer.from(v).toString('base64url');

test('search y validación de fechas ISO reales', () => {
  assert.equal(normalizeSearchText('  Estructura Básica — Órgano '), 'estructura basica — organo');
  assert.equal(normalizeSearchText('Criptografía'), 'criptografia');
  assert.equal(isValidIsoDate('2026-11-24'), true);
  assert.equal(isValidIsoDate('2024-02-29'), true);
  assert.equal(isValidIsoDate('2025-02-29'), false);
  assert.equal(isValidIsoDate('2026-02-31'), false);
  assert.equal(isValidIsoDate('2026-99-99'), false);
  assert.equal(isValidIsoDate('24-11-2026'), false);
});

test('organigrama cumple las reglas estatutarias de poderes y niveles', () => {
  assert.equal(organigrama.poderes.length, 3);
  assert.equal(organigrama.niveles.length, 5);

  const n1 = organigrama.niveles.find((n) => n.nivel === 1);
  const n2 = organigrama.niveles.find((n) => n.nivel === 2);
  const n3 = organigrama.niveles.find((n) => n.nivel === 3);
  const n4 = organigrama.niveles.find((n) => n.nivel === 4);

  assert.ok(n1 && n2 && n3 && n4);
  assert.equal(n1.plazasMin, 3);
  assert.equal(n1.plazasMax, 3);
  assert.equal(n1.puedePostular, false);
  assert.equal(n1.puedeTenerEmpresas, false);

  assert.equal(n2.plazasMin, 5);
  assert.equal(n2.plazasMax, 13);
  assert.ok(Array.isArray(n2.plazasPermitidas));
  for (const count of n2.plazasPermitidas) {
    assert.equal(count % 2, 1, `Nivel 2 debe ser impar: ${count}`);
  }
  assert.equal(n2.puedePostular, false);
  assert.equal(n2.puedeTenerEmpresas, false);

  assert.equal(n3.puedePostular, true);
  assert.equal(n4.escuelaMinimaMeses, 6);
  assert.equal(organigrama.escuelaPolitica.duracionMinimaMeses, 6);
  assert.equal(organigrama.escuelaPolitica.atajosPermitidos, false);
});

test('tesorería valida integridad estricta, filtra sin tildes y neutraliza CSV injection', () => {
  const resumenReal = calcularResumen(tesoreria);
  assert.equal(
    resumenReal.saldoNetoCentimos,
    resumenReal.saldoInicialCentimos + resumenReal.totalIngresosCentimos - resumenReal.totalEgresosCentimos
  );

  const movs = [
    {
      id: 'MOV-1',
      fecha: '2026-11-23',
      tipo: 'ingreso',
      categoria: 'Aportes',
      concepto: '=SUM(A1:A2)',
      montoCentimos: 2550,
    },
    {
      id: 'MOV-2',
      fecha: '2026-11-23',
      tipo: 'egreso',
      categoria: 'Operación',
      concepto: 'Impresión básica de cartillas',
      montoCentimos: 550,
    },
  ];

  const resumenSimulado = calcularResumen({
    ejercicio: '2026',
    moneda: 'PEN',
    simbolo: 'S/',
    saldoInicialCentimos: 1000,
    ultimaActualizacion: '2026-11-23',
    responsable: 'Prueba',
    movimientos: movs,
  });

  assert.equal(resumenSimulado.totalIngresosCentimos, 2550);
  assert.equal(resumenSimulado.totalEgresosCentimos, 550);
  assert.equal(resumenSimulado.saldoNetoCentimos, 3000);

  const filtrados = filtrarMovimientos(movs, { query: 'impresion basica' });
  assert.equal(filtrados.length, 1);
  assert.equal(filtrados[0].id, 'MOV-2');

  assert.throws(() =>
    calcularResumen({
      ejercicio: '2026',
      moneda: 'PEN',
      simbolo: 'S/',
      saldoInicialCentimos: 10.5,
      ultimaActualizacion: '2026-11-23',
      responsable: 'Prueba',
      movimientos: [],
    })
  );

  assert.throws(() =>
    calcularResumen({
      ejercicio: '2026',
      moneda: 'PEN',
      simbolo: 'S/',
      saldoInicialCentimos: 0,
      ultimaActualizacion: '2026-11-23',
      responsable: 'Prueba',
      movimientos: [movs[0], movs[0]],
    })
  );

  assert.throws(() =>
    calcularResumen({
      ejercicio: '2026',
      moneda: 'PEN',
      simbolo: 'S/',
      saldoInicialCentimos: 0,
      ultimaActualizacion: '2026-11-23',
      responsable: 'Prueba',
      movimientos: [{ ...movs[0], fecha: '2026-02-31' }],
    })
  );

  const csv = exportarCsvSeguro([
    {
      id: 'MOV-1',
      fecha: '2026-11-23',
      tipo: 'ingreso',
      categoria: 'Aportes',
      concepto: '=CMD|calc',
      montoCentimos: 100,
    },
  ]);
  assert.match(csv, /"'=CMD\|calc"/);
});

test('verificador Ed25519 valida kid, saltos de línea y rechaza incoherencias de esquema', async () => {
  const validRes = await verifyCarnetToken(DEMO_SAMPLE_TOKEN, []);
  assert.equal(validRes.status, 'valid');
  if (validRes.status === 'valid') {
    assert.equal(validRes.isDemo, true);
    assert.equal(validRes.payload.id, 'PU-N4-DEMO-7K9P');
    assert.equal(validRes.payload.kid, 'demo-2026-01');
    assert.equal(validRes.payload.nivel, 4);
  }

  // Pegado desde WhatsApp con saltos de línea intercalados
  const wrapped = DEMO_SAMPLE_TOKEN.slice(0, 25) + '\n  ' + DEMO_SAMPLE_TOKEN.slice(25);
  const wrappedRes = await verifyCarnetToken(wrapped, []);
  assert.equal(wrappedRes.status, 'valid');

  const badKidRes = await verifyCarnetToken(BAD_KID_TOKEN, []);
  assert.equal(badKidRes.status, 'invalid');

  // Incoherencia ID PU-N3 con nivel 4
  const mismatchLevel = `PU1.${b64u(
    JSON.stringify({
      id: 'PU-N3-DEMO-7K9P',
      kid: 'demo-2026-01',
      nivel: 4,
      emitido: '2026-11-23',
      tipo: 'DEMO',
      escuelaCertificada: false,
    })
  )}.sig`;
  assert.equal((await verifyCarnetToken(mismatchLevel, [])).status, 'invalid');

  // Incoherencia DEMO con tipo OFICIAL
  const mismatchTipo = `PU1.${b64u(
    JSON.stringify({
      id: 'PU-N4-DEMO-7K9P',
      kid: 'demo-2026-01',
      nivel: 4,
      emitido: '2026-11-23',
      tipo: 'OFICIAL',
      escuelaCertificada: false,
    })
  )}.sig`;
  assert.equal((await verifyCarnetToken(mismatchTipo, [])).status, 'invalid');

  // Fecha imposible
  const badDate = `PU1.${b64u(
    JSON.stringify({
      id: 'PU-N4-DEMO-7K9P',
      kid: 'demo-2026-01',
      nivel: 4,
      emitido: '2026-02-31',
      tipo: 'DEMO',
      escuelaCertificada: false,
    })
  )}.sig`;
  assert.equal((await verifyCarnetToken(badDate, [])).status, 'invalid');

  const tampered = DEMO_SAMPLE_TOKEN.slice(0, -4) + 'XXXX';
  assert.equal((await verifyCarnetToken(tampered, [])).status, 'invalid');

  const revokedRes = await verifyCarnetToken(DEMO_SAMPLE_TOKEN, ['PU-N4-DEMO-7K9P']);
  assert.equal(revokedRes.status, 'revoked');
});

test('política de soberanía CI/CD, privacidad, cero CDNs externos y activos visuales', () => {
  assert.equal(
    fs.existsSync(path.join(rootDir, '.github', 'workflows')),
    false,
    'No deben existir workflows de GitHub Actions (.github/workflows)'
  );

  const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  assert.match(gitignore, /^_privado\/$/m);
  assert.match(gitignore, /^\*\.ogg$/m);

  assert.equal(fs.existsSync(path.join(rootDir, 'src', 'pages', 'privacidad.astro')), true);
  assert.equal(
    fs.existsSync(path.join(rootDir, 'src', 'content', 'documentos', 'arquitectura-fase-2-seguridad.md')),
    true
  );

  assert.equal(fs.existsSync(path.join(rootDir, 'public', 'img', 'og-whatsapp-1200x630.jpg')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'src', 'assets', 'img', 'hero-amanecer-civico.webp')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'src', 'assets', 'img', 'visual-transparencia.webp')), true);
  assert.equal(fs.existsSync(path.join(rootDir, 'src', 'components', 'EscuelaIlustracionSvg.astro')), true);

  // Garantizar cero llamadas a fuentes externas de Google en src/
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(astro|ts|js|css|md)$/i.test(entry.name)) {
        const text = fs.readFileSync(full, 'utf8');
        assert.doesNotMatch(text, /fonts\.googleapis\.com|fonts\.gstatic\.com/i, `Fuente externa prohibida en ${full}`);
      }
    }
  };
  walk(path.join(rootDir, 'src'));
});
