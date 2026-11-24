import { isValidIsoDate } from './search.ts';

export interface CarnetPayload {
  id: string;
  kid: string;
  nivel: 3 | 4;
  emitido: string;
  tipo: 'DEMO' | 'OFICIAL';
  escuelaCertificada: boolean;
}

export type VerifyResult =
  | { status: 'valid'; payload: CarnetPayload; isDemo: boolean }
  | { status: 'revoked'; payload: CarnetPayload; reason: string }
  | { status: 'invalid'; reason: string }
  | { status: 'unsupported'; message: string };

export type KeyCustody = 'DEMO' | 'HOT_WORKER_N4' | 'COLD_NIVEL2_N3';

export interface PublicKeyEntry {
  jwk: JsonWebKey;
  allowedLevels: readonly (3 | 4)[];
  custody: KeyCustody;
}

export const DEMO_PUBLIC_KEYS: Record<string, PublicKeyEntry> = {
  'demo-2026-01': {
    jwk: {
      key_ops: ['verify'],
      ext: true,
      alg: 'Ed25519',
      kty: 'OKP',
      crv: 'Ed25519',
      x: '4tJlhgpBFU5T3cL5_gqDbFplWGjffLHEYpr6rwtZTnA',
    },
    allowedLevels: [4],
    custody: 'DEMO',
  },
};

// Reservada para Fase 2: claves públicas oficiales indexadas por `kid` con alcance estricto por nivel:
// - custody: 'HOT_WORKER_N4' -> allowedLevels: [4] (firma automatizada en Cloudflare Workers)
// - custody: 'COLD_NIVEL2_N3' -> allowedLevels: [3] (llave fría custodiada por Nivel 2 tras examen oral y antecedentes)
export const OFFICIAL_PUBLIC_KEYS: Record<string, PublicKeyEntry> = {};

export const DEMO_SAMPLE_TOKEN =
  'PU1.eyJpZCI6IlBVLU40LURFTU8tN0s5UCIsImtpZCI6ImRlbW8tMjAyNi0wMSIsIm5pdmVsIjo0LCJlbWl0aWRvIjoiMjAyNi0xMS0yMyIsInRpcG8iOiJERU1PIiwiZXNjdWVsYUNlcnRpZmljYWRhIjpmYWxzZX0.gLZOskAWq_j5sE_uOAXanvJqYWk9X2Pm4C_CRImEWpQl3vblqa-qIVrJicVqhxYj38CBuH3XPzLyPA-EqLPtCw';

function decodeBase64UrlToBytes(input: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) {
    throw new Error('Codificación Base64URL inválida');
  }
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function isValidPayload(data: unknown): data is CarnetPayload {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;

  if (typeof record.id !== 'string' || !/^PU-N[34]-(?:DEMO|[A-Z0-9]{4})-[A-Z0-9]{4}$/.test(record.id)) {
    return false;
  }
  if (typeof record.kid !== 'string' || !/^[a-z0-9-]+$/.test(record.kid)) {
    return false;
  }
  if (record.nivel !== 3 && record.nivel !== 4) {
    return false;
  }
  if (!record.id.startsWith(`PU-N${record.nivel}-`)) {
    return false;
  }
  if (typeof record.emitido !== 'string' || !isValidIsoDate(record.emitido)) {
    return false;
  }
  if (record.tipo !== 'DEMO' && record.tipo !== 'OFICIAL') {
    return false;
  }
  const hasDemoSegment = record.id.includes('-DEMO-');
  if (record.tipo === 'DEMO' && !hasDemoSegment) {
    return false;
  }
  if (record.tipo === 'OFICIAL' && hasDemoSegment) {
    return false;
  }
  if (typeof record.escuelaCertificada !== 'boolean') {
    return false;
  }
  if (record.nivel === 3 && !record.escuelaCertificada) {
    return false;
  }
  return true;
}

export async function verifyCarnetToken(
  rawToken: string,
  revokedIds: readonly string[] = []
): Promise<VerifyResult> {
  const token = String(rawToken ?? '').replace(/\s+/g, '');
  if (!token) {
    return { status: 'invalid', reason: 'Ingresa una credencial para verificar.' };
  }

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'PU1') {
    return {
      status: 'invalid',
      reason: 'Formato inválido. Una credencial válida comienza con "PU1." y contiene tres segmentos.',
    };
  }

  const [, payloadB64, signatureB64] = parts;

  let payload: unknown;
  let sigBytes: Uint8Array<ArrayBuffer>;
  try {
    const payloadBytes = decodeBase64UrlToBytes(payloadB64);
    const payloadText = new TextDecoder().decode(payloadBytes);
    payload = JSON.parse(payloadText);
    sigBytes = decodeBase64UrlToBytes(signatureB64);
  } catch {
    return {
      status: 'invalid',
      reason: 'No se pudo decodificar la carga útil o la firma de la credencial.',
    };
  }

  if (!isValidPayload(payload)) {
    return {
      status: 'invalid',
      reason: 'La estructura interna de la credencial no cumple el esquema oficial del partido.',
    };
  }

  const keyRegistry = payload.tipo === 'DEMO' ? DEMO_PUBLIC_KEYS : OFFICIAL_PUBLIC_KEYS;
  const keyEntry = Object.hasOwn(keyRegistry, payload.kid) ? keyRegistry[payload.kid] : null;
  if (!keyEntry) {
    return {
      status: 'invalid',
      reason:
        payload.tipo === 'OFICIAL'
          ? `La clave pública oficial "${payload.kid}" aún no ha sido publicada o no corresponde al registro de Fase 2.`
          : `El identificador de clave "${payload.kid}" no existe en el registro autorizado.`,
    };
  }
  if (!keyEntry.allowedLevels.includes(payload.nivel)) {
    return {
      status: 'invalid',
      reason: `La clave "${payload.kid}" no está autorizada para emitir credenciales de Nivel ${payload.nivel}.`,
    };
  }
  const publicKeyJwk = keyEntry.jwk;

  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    return {
      status: 'unsupported',
      message: 'Web Crypto API no está disponible en este entorno o navegador.',
    };
  }

  let verified = false;
  try {
    const cryptoKey = await subtle.importKey(
      'jwk',
      publicKeyJwk,
      { name: 'Ed25519' },
      false,
      ['verify']
    );
    const encodedMessage = new TextEncoder().encode(payloadB64);
    verified = await subtle.verify('Ed25519', cryptoKey, sigBytes, encodedMessage);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotSupportedError') {
      return {
        status: 'unsupported',
        message: 'Este navegador aún no soporta verificación Ed25519 nativa en Web Crypto.',
      };
    }
    return {
      status: 'invalid',
      reason: 'Error criptográfico al verificar la firma Ed25519.',
    };
  }

  if (!verified) {
    return {
      status: 'invalid',
      reason: 'Firma criptográfica inválida: la credencial fue alterada o no fue firmada por esta clave.',
    };
  }

  if (revokedIds.includes(payload.id)) {
    return {
      status: 'revoked',
      payload,
      reason: 'La firma es auténtica, pero este identificador figura en el registro público de revocaciones.',
    };
  }

  return {
    status: 'valid',
    payload,
    isDemo: payload.tipo === 'DEMO',
  };
}
