export interface MovimientoTesoreria {
  id: string;
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  concepto: string;
  montoCentimos: number;
  comprobanteRef?: string;
}

export interface LibroTesoreria {
  ejercicio: string;
  moneda: string;
  simbolo: string;
  saldoInicialCentimos: number;
  ultimaActualizacion: string;
  responsable: string;
  movimientos: MovimientoTesoreria[];
}

export interface ResumenTesoreria {
  saldoInicialCentimos: number;
  totalIngresosCentimos: number;
  totalEgresosCentimos: number;
  saldoNetoCentimos: number;
  cantidadMovimientos: number;
  porCategoria: Record<string, { ingresosCentimos: number; egresosCentimos: number }>;
}

export function formatearMoneda(centimos: number, simbolo = 'S/'): string {
  const signo = centimos < 0 ? '-' : '';
  const abs = Math.abs(centimos);
  const enteros = Math.floor(abs / 100).toLocaleString('es-PE');
  const decimales = String(abs % 100).padStart(2, '0');
  return `${signo}${simbolo} ${enteros}.${decimales}`;
}

export function calcularResumen(libro: LibroTesoreria): ResumenTesoreria {
  let totalIngresosCentimos = 0;
  let totalEgresosCentimos = 0;
  const porCategoria: Record<string, { ingresosCentimos: number; egresosCentimos: number }> = {};

  for (const mov of libro.movimientos) {
    if (!Number.isInteger(mov.montoCentimos) || mov.montoCentimos < 0) {
      throw new Error(`Monto inválido en movimiento ${mov.id}: debe ser entero en céntimos >= 0`);
    }
    if (!porCategoria[mov.categoria]) {
      porCategoria[mov.categoria] = { ingresosCentimos: 0, egresosCentimos: 0 };
    }
    if (mov.tipo === 'ingreso') {
      totalIngresosCentimos += mov.montoCentimos;
      porCategoria[mov.categoria].ingresosCentimos += mov.montoCentimos;
    } else if (mov.tipo === 'egreso') {
      totalEgresosCentimos += mov.montoCentimos;
      porCategoria[mov.categoria].egresosCentimos += mov.montoCentimos;
    } else {
      throw new Error(`Tipo de movimiento desconocido en ${mov.id}`);
    }
  }

  return {
    saldoInicialCentimos: libro.saldoInicialCentimos,
    totalIngresosCentimos,
    totalEgresosCentimos,
    saldoNetoCentimos: libro.saldoInicialCentimos + totalIngresosCentimos - totalEgresosCentimos,
    cantidadMovimientos: libro.movimientos.length,
    porCategoria,
  };
}

function sanitizeCsvCell(value: string): string {
  const str = String(value ?? '');
  const neutralized = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  const escaped = neutralized.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function exportarCsvSeguro(movimientos: readonly MovimientoTesoreria[], simbolo = 'S/'): string {
  const headers = ['ID', 'Fecha', 'Tipo', 'Categoria', 'Concepto', `Monto (${simbolo})`, 'Comprobante'];
  const lines = [headers.map(sanitizeCsvCell).join(',')];

  for (const mov of movimientos) {
    const row = [
      mov.id,
      mov.fecha,
      mov.tipo,
      mov.categoria,
      mov.concepto,
      (mov.montoCentimos / 100).toFixed(2),
      mov.comprobanteRef ?? '',
    ];
    lines.push(row.map(sanitizeCsvCell).join(','));
  }

  return lines.join('\r\n');
}
