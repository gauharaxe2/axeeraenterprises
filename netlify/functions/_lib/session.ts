import { SESSION_TTL_SECONDS } from './http.ts';

const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  try {
    const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  } catch {
    return null;
  }
}

export function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index];
  return diff === 0;
}

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign'
  ]);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return new Uint8Array(signature);
}

export async function passwordMatches(provided: string, expected: string, secret: string): Promise<boolean> {
  if (!provided || !expected || !secret) return false;
  const [left, right] = await Promise.all([
    hmac(secret, `ae-admin-pw.${provided}`),
    hmac(secret, `ae-admin-pw.${expected}`)
  ]);
  return timingSafeEqual(left, right);
}

interface SessionPayload {
  v: number;
  iat: number;
  exp: number;
}

export async function createSessionToken(secret: string, nowMs: number): Promise<string> {
  const nowSeconds = Math.floor(nowMs / 1000);
  const payload: SessionPayload = { v: 1, iat: nowSeconds, exp: nowSeconds + SESSION_TTL_SECONDS };
  const payloadPart = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(secret, `ae-admin-v1.${payloadPart}`));
  return `${payloadPart}.${signature}`;
}

export async function verifySessionToken(token: string, secret: string, nowMs: number): Promise<boolean> {
  if (!secret || !token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadPart, signaturePart] = parts;
  if (!payloadPart || !signaturePart) return false;
  const provided = base64UrlToBytes(signaturePart);
  if (!provided) return false;
  const expected = await hmac(secret, `ae-admin-v1.${payloadPart}`);
  if (!timingSafeEqual(provided, expected)) return false;
  const payloadBytes = base64UrlToBytes(payloadPart);
  if (!payloadBytes) return false;
  let payload: SessionPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload;
  } catch {
    return false;
  }
  if (!payload || payload.v !== 1) return false;
  if (!Number.isFinite(payload.iat) || !Number.isFinite(payload.exp)) return false;
  if (payload.exp - payload.iat > SESSION_TTL_SECONDS + 60) return false;
  const nowSeconds = Math.floor(nowMs / 1000);
  if (payload.iat > nowSeconds + 60) return false;
  if (payload.exp <= nowSeconds) return false;
  return true;
}
