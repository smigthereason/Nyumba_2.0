import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { cookies } from 'next/headers';

const scryptAsync = promisify(scrypt);

export const SESSION_COOKIE = 'nyumba_agency';
const MAX_AGE = 7 * 24 * 60 * 60;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!value || value.length < 32) {
      throw new Error('SESSION_SECRET must be set to at least 32 characters in production.');
    }
    return value;
  }
  return value || 'nyumba-agency-dashboard-dev-secret-change-me';
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, 'hex');
  if (buf.length !== storedBuf.length) return false;
  return timingSafeEqual(buf, storedBuf);
}

function sign(payload: string): string {
  const sig = createHmac('sha256', secret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function unsign(token: string): string | null {
  const i = token.lastIndexOf('.');
  if (i < 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac('sha256', secret()).update(payload).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}

export function makeSessionToken(agencyId: string): string {
  const exp = Date.now() + MAX_AGE * 1000;
  return sign(JSON.stringify({ agencyId, exp }));
}

export function readSessionToken(token: string): { agencyId: string } | null {
  const payload = unsign(token);
  if (!payload) return null;
  try {
    const data = JSON.parse(payload) as { agencyId?: string; exp?: number };
    if (!data.agencyId || typeof data.exp !== 'number' || data.exp < Date.now()) {
      return null;
    }
    return { agencyId: data.agencyId };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  };
}

export async function getSessionAgencyId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token)?.agencyId ?? null;
}
