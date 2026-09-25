import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { DataStoreError, consumeRateLimit } from '@/lib/db';

const MAX_JSON_BYTES = 32 * 1024;

export type ApiErrorBody = {
  error: string;
  code: string;
  requestId: string;
};

export function requestId(req?: Request): string {
  return req?.headers.get('x-request-id')?.slice(0, 100) || randomUUID();
}

export function json<T>(body: T, init: ResponseInit = {}, id?: string): NextResponse<T> {
  const res = NextResponse.json(body, init);
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'same-origin');
  if (id) res.headers.set('X-Request-Id', id);
  return res;
}

export function apiError(message: string, code: string, status: number, id: string) {
  return json<ApiErrorBody>({ error: message, code, requestId: id }, { status }, id);
}

export async function parseJsonObject(
  req: Request,
  id: string
): Promise<Record<string, unknown> | NextResponse<ApiErrorBody>> {
  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BYTES) {
    return apiError('Request body is too large.', 'PAYLOAD_TOO_LARGE', 413, id);
  }
  const contentType = req.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('application/json')) {
    return apiError('Content-Type must be application/json.', 'UNSUPPORTED_MEDIA_TYPE', 415, id);
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return apiError('Invalid JSON request.', 'INVALID_REQUEST', 400, id);
  }
  return body as Record<string, unknown>;
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || req.headers.get('x-real-ip') || 'unknown';
}

export async function enforceRateLimit(
  req: Request,
  namespace: string,
  limit: number,
  windowSeconds: number,
  id: string
): Promise<NextResponse<ApiErrorBody> | null> {
  const key = `${namespace}:${clientIp(req)}`;
  const result = await consumeRateLimit(key, limit, windowSeconds);
  if (result.allowed) return null;
  const res = apiError('Too many requests. Try again shortly.', 'RATE_LIMITED', 429, id);
  res.headers.set('Retry-After', String(Math.max(1, Math.ceil((Date.parse(result.resetAt) - Date.now()) / 1000))));
  res.headers.set('X-RateLimit-Remaining', String(result.remaining));
  return res;
}

export function allowedOrigin(req: Request): string | null {
  const origin = req.headers.get('origin');
  if (!origin) return null;
  const configured = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV !== 'production') {
    configured.push('http://localhost:8081', 'http://localhost:19006', 'http://localhost:3000');
  }
  return configured.includes(origin) ? origin : null;
}

export function withCors(req: Request, res: NextResponse): NextResponse {
  const origin = allowedOrigin(req);
  if (origin) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Vary', 'Origin');
    res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');
  }
  return res;
}

export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get('origin');
  return !origin || Boolean(allowedOrigin(req));
}

export function handleApiError(error: unknown, id: string): NextResponse<ApiErrorBody> {
  if (error instanceof DataStoreError) {
    if (error.code === 'EMAIL_TAKEN') return apiError('That email is already in use.', 'EMAIL_TAKEN', 409, id);
    if (error.code === 'NOT_FOUND') return apiError('Resource not found.', 'NOT_FOUND', 404, id);
    if (error.code === 'BACKEND_NOT_CONFIGURED') return apiError('Backend configuration is incomplete.', 'BACKEND_NOT_CONFIGURED', 503, id);
    if (error.code === 'BACKEND_UNAVAILABLE' || error.code === 'BACKEND_INVALID_RESPONSE') {
      return apiError('Backend is temporarily unavailable.', 'BACKEND_UNAVAILABLE', 503, id);
    }
  }
  console.error('[nyumba-api]', { requestId: id, error });
  return apiError('Something went wrong on our side.', 'INTERNAL_ERROR', 500, id);
}
