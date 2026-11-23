import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calcularResumen, exportarCsvSeguro } from '../src/lib/tesoreria-metrics.ts';
import { DEMO_SAMPLE_TOKEN, verifyCarnetToken } from '../src/lib/crypto-carnet.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const organigrama = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'src', 'data', 'organigrama.json'), 'utf8')
);
const tesoreria = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'src', 'data', 'tesoreria.json'), 'utf8')
);

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

test('tesorería cuadra matemáticamente en céntimos y neutraliza CSV injection', () => {
  const resumenReal = calcularResumen(tesoreria);
  assert.equal(
    resumenReal.saldoNetoCentimos,
    resumenReal.saldoInicialCentimos + resumenReal.totalIngresosCentimos - resumenReal.totalEgresosCentimos
  );

  const resumenSimulado = calcularResumen({
    ejercicio: '2026',
    moneda: 'PEN',
    simbolo: 'S/',
    saldoInicialCentimos: 1000,
    ultimaActualizacion: '2026-11-23',
    responsable: 'Prueba',
    movimientos: [
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
        concepto: 'Impresión de volantes',
        montoCentimos: 550,
      },
    ],
  });

  assert.equal(resumenSimulado.totalIngresosCentimos, 2550);
  assert.equal(resumenSimulado.totalEgresosCentimos, 550);
  assert.equal(resumenSimulado.saldoNetoCentimos, 3000);

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

test('verificador criptográfico Ed25519 valida demo, rechaza alterados y detecta revocados', async () => {
  const validRes = await verifyCarnetToken(DEMO_SAMPLE_TOKEN, []);
  assert.equal(validRes.status, 'valid');
  if (validRes.status === 'valid') {
    assert.equal(validRes.isDemo, true);
    assert.equal(validRes.payload.id, 'PU-N4-DEMO-7K9P');
    assert.equal(validRes.payload.nivel, 4);
  }

  const tampered = DEMO_SAMPLE_TOKEN.slice(0, -4) + 'XXXX';
  const invalidRes = await verifyCarnetToken(tampered, []);
  assert.equal(invalidRes.status, 'invalid');

  const revokedRes = await verifyCarnetToken(DEMO_SAMPLE_TOKEN, ['PU-N4-DEMO-7K9P']);
  assert.equal(revokedRes.status, 'revoked');
});

test('política de soberanía CI/CD y privacidad de repositorio', () => {
  assert.equal(
    fs.existsSync(path.join(rootDir, '.github', 'workflows')),
    false,
    'No deben existir workflows de GitHub Actions (.github/workflows)'
  );

  const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  assert.match(gitignore, /^_privado\/$/m);
  assert.match(gitignore, /^\*\.ogg$/m);
});
