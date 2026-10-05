import { NextResponse } from 'next/server';
import {
  apiError,
  enforceRateLimit,
  handleApiError,
  isOriginAllowed,
  json,
  parseJsonObject,
  requestId,
  withCors,
} from '@/lib/api';
import { createPublicLead, listAgencyLeads } from '@/lib/db';
import { requireApiAgency } from '@/lib/session';

async function authenticatedBuyerId(req: Request): Promise<string | null> {
  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: serviceKey,
        Authorization: authorization,
      },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { id?: string };
    return payload.id ?? null;
  } catch {
    return null;
  }
}

export async function OPTIONS(req: Request) {
  const id = requestId(req);
  if (!isOriginAllowed(req)) return apiError('Origin not allowed.', 'ORIGIN_NOT_ALLOWED', 403, id);
  const res = new NextResponse(null, { status: 204 });
  res.headers.set('X-Request-Id', id);
  return withCors(req, res);
}

export async function GET(req: Request) {
  const id = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') ?? 50);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    return json({ leads: await listAgencyLeads(auth.agency.id, limit, offset) }, {}, id);
  } catch (error) {
    return handleApiError(error, id);
  }
}

export async function POST(req: Request) {
  const id = requestId(req);
  try {
    if (!isOriginAllowed(req)) {
      return withCors(req, apiError('Origin not allowed.', 'ORIGIN_NOT_ALLOWED', 403, id));
    }
    const limited = await enforceRateLimit(req, 'public-lead', 20, 3600, id);
    if (limited) return withCors(req, limited);
    const body = await parseJsonObject(req, id);
    if (body instanceof Response) return withCors(req, body);

    const propertyId = String(body.propertyId ?? '').trim().slice(0, 120);
    const agencyId = String(body.agencyId ?? '').trim().slice(0, 120);
    const message = String(body.message ?? '').trim().slice(0, 2000);
    const name = String(body.name ?? '').trim().slice(0, 120) || undefined;
    const phone = String(body.phone ?? '').trim().slice(0, 30) || undefined;
    const type = body.type === 'purchase' ? 'purchase' : 'viewing';

    if (!propertyId || !agencyId || message.length < 3) {
      return withCors(
        req,
        apiError('propertyId, agencyId, and a message are required.', 'INVALID_LEAD', 400, id)
      );
    }
    if (!name || name.length < 2) {
      return withCors(req, apiError('Enter your name.', 'INVALID_NAME', 400, id));
    }
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      return withCors(
        req,
        apiError('Enter a valid phone number so the agency can contact you.', 'INVALID_PHONE', 400, id)
      );
    }

    const userId = await authenticatedBuyerId(req);
    const lead = await createPublicLead({
      propertyId,
      agencyId,
      userId,
      name,
      phone,
      message,
      type,
    });
    return withCors(req, json({ ok: true, lead }, { status: 201 }, id));
  } catch (error) {
    return withCors(req, handleApiError(error, id));
  }
}
