import { makeSessionToken, sessionCookieOptions } from '@/lib/auth';
import { apiError, handleApiError, json, requestId } from '@/lib/api';
import { GUEST_AGENCY_ID } from '@/lib/guest-id';

/** Public preview session, explicitly not a real Supabase account. */
export async function POST(req: Request) {
  const id = requestId(req);
  try {
    const origin = req.headers.get('origin');
    if (origin && new URL(origin).host !== new URL(req.url).host) {
      return apiError('Invalid origin.', 'INVALID_ORIGIN', 403, id);
    }
    const res = json({ ok: true, demo: true }, {}, id);
    res.cookies.set(sessionCookieOptions(makeSessionToken(GUEST_AGENCY_ID)));
    return res;
  } catch (error) {
    return handleApiError(error, id);
  }
}
