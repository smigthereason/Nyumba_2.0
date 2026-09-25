import { hashPassword, makeSessionToken, sessionCookieOptions } from '@/lib/auth';
import { apiError, enforceRateLimit, handleApiError, json, parseJsonObject, requestId } from '@/lib/api';
import { createAgencyAccount } from '@/lib/db';
import { slugify, uid } from '@/lib/format';
import { counties } from '@/lib/mock/locations';
import type { Agency } from '@/lib/types';
import { isEmail } from '@/lib/validate';

export async function POST(req: Request) {
  const id = requestId(req);
  try {
    const limited = await enforceRateLimit(req, 'agency-signup', 5, 3600, id);
    if (limited) return limited;

    const body = await parseJsonObject(req, id);
    if (body instanceof Response) return body;

    const name = String(body.name ?? '').trim().slice(0, 120);
    const email = String(body.email ?? '').trim().toLowerCase().slice(0, 254);
    const phone = String(body.phone ?? '').trim().slice(0, 30);
    const password = String(body.password ?? '');
    const bio = String(body.bio ?? '').trim().slice(0, 1200);
    const whatsapp = String(body.whatsapp ?? phone.replace(/\D/g, '')).trim().slice(0, 30);
    const selected = Array.isArray(body.counties) ? (body.counties as unknown[]).map(String) : [];
    const validCounties = [...new Set(selected.filter((c) => counties.some((x) => x.name === c)))];

    if (name.length < 2) return apiError('Enter your agency name.', 'INVALID_NAME', 400, id);
    if (!isEmail(email)) return apiError('Enter a valid email.', 'INVALID_EMAIL', 400, id);
    if (phone.replace(/\D/g, '').length < 7) return apiError('Enter a valid phone number.', 'INVALID_PHONE', 400, id);
    if (password.length < 10 || password.length > 128) return apiError('Password must be between 10 and 128 characters.', 'WEAK_PASSWORD', 400, id);
    if (validCounties.length === 0) return apiError('Pick at least one county you cover.', 'INVALID_COUNTY', 400, id);

    const passwordHash = await hashPassword(password);
    const agencyId = uid('agency');
    const agency: Agency = {
      id: agencyId,
      name,
      slug: `${slugify(name)}-${agencyId.slice(-6)}`,
      logoUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=200&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=600&fit=crop',
      bio: bio || `${name} — trusted homes across Kenya.`,
      verified: false,
      rating: 0,
      reviewCount: 0,
      listingCount: 0,
      phone,
      whatsapp,
      email,
      counties: validCounties,
      yearsActive: 1,
      responseRate: 100,
      featured: false,
    };

    const created = await createAgencyAccount({ agency, passwordHash });
    const res = json({ ok: true, agency: created }, { status: 201 }, id);
    res.cookies.set(sessionCookieOptions(makeSessionToken(created.id)));
    return res;
  } catch (error) {
    return handleApiError(error, id);
  }
}
