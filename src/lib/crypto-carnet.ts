export interface CarnetPayload {
  id: string;
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

export const DEMO_PUBLIC_KEY_JWK: JsonWebKey = {
  key_ops: ['verify'],
  ext: true,
  alg: 'Ed25519',
  kty: 'OKP',
  crv: 'Ed25519',
  x: 'E_SMhjcsC7sMniweS1JX9LTDyJXX6TiQyI-Ze4bI-ME',
};

// Reservada para Fase 2: clave pública oficial generada por el Poder Constitucional (Nivel 2).
export const OFFICIAL_PUBLIC_KEY_JWK: JsonWebKey | null = null;

export const DEMO_SAMPLE_TOKEN =
  'PU1.eyJpZCI6IlBVLU40LURFTU8tN0s5UCIsIm5pdmVsIjo0LCJlbWl0aWRvIjoiMjAyNi0xMS0yMyIsInRpcG8iOiJERU1PIiwiZXNjdWVsYUNlcnRpZmljYWRhIjpmYWxzZX0.XsdrJve9s-945zSxEkppoIFd6EQc6ZU0WeoyH5NFf-5ZKN9zC6Z3Vzi_BP59QpT1pV17WWu3GyobdxMsoy_NBA';

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
  if (record.nivel !== 3 && record.nivel !== 4) {
    return false;
  }
  if (typeof record.emitido !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.emitido)) {
    return false;
  }
  if (record.tipo !== 'DEMO' && record.tipo !== 'OFICIAL') {
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
  const token = rawToken.trim();
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

  const publicKeyJwk = payload.tipo === 'DEMO' ? DEMO_PUBLIC_KEY_JWK : OFFICIAL_PUBLIC_KEY_JWK;
  if (!publicKeyJwk) {
    return {
      status: 'invalid',
      reason:
        'La clave pública oficial de Fase 2 aún no ha sido emitida por el Poder Constitucional (Nivel 2).',
    };
  }

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
