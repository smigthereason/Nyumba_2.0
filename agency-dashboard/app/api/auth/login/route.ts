import { makeSessionToken, sessionCookieOptions, verifyPassword } from '@/lib/auth';
import { apiError, enforceRateLimit, handleApiError, json, parseJsonObject, requestId } from '@/lib/api';
import { findAgencyAccountByEmail } from '@/lib/db';
import { isEmail } from '@/lib/validate';

export async function POST(req: Request) {
  const id = requestId(req);
  try {
    const limited = await enforceRateLimit(req, 'agency-login', 10, 300, id);
    if (limited) return limited;

    const body = await parseJsonObject(req, id);
    if (body instanceof Response) return body;

    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (!isEmail(email) || !password || password.length > 128) {
      return apiError('Enter a valid email and password.', 'INVALID_CREDENTIALS', 400, id);
    }

    const account = await findAgencyAccountByEmail(email);
    if (!account || !(await verifyPassword(password, account.passwordHash))) {
      return apiError('Those details do not match an agency.', 'INVALID_CREDENTIALS', 401, id);
    }

    const res = json({ ok: true }, {}, id);
    res.cookies.set(sessionCookieOptions(makeSessionToken(account.agency.id)));
    return res;
  } catch (error) {
    return handleApiError(error, id);
  }
}
