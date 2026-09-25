import { apiError, handleApiError, json, parseJsonObject, requestId } from '@/lib/api';
import { updateAgencyProfile } from '@/lib/db';
import { counties } from '@/lib/mock/locations';
import { requireApiAgency } from '@/lib/session';
import type { BankAccount } from '@/lib/types';
import { isEmail } from '@/lib/validate';

export async function GET(req: Request) {
  const id = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    return json({ agency: auth.agency }, {}, id);
  } catch (error) {
    return handleApiError(error, id);
  }
}

export async function PUT(req: Request) {
  const id = requestId(req);
  try {
    const auth = await requireApiAgency();
    if (auth.error) return auth.error;
    const body = await parseJsonObject(req, id);
    if (body instanceof Response) return body;

    const name = String(body.name ?? '').trim().slice(0, 120);
    const email = String(body.email ?? '').trim().toLowerCase().slice(0, 254);
    const phone = String(body.phone ?? '').trim().slice(0, 30);
    const bio = String(body.bio ?? '').trim().slice(0, 1200);
    if (name.length < 2) return apiError('Enter your agency name.', 'INVALID_NAME', 400, id);
    if (!isEmail(email)) return apiError('Enter a valid email.', 'INVALID_EMAIL', 400, id);
    if (phone.replace(/\D/g, '').length < 7) return apiError('Enter a phone number.', 'INVALID_PHONE', 400, id);

    const selected = Array.isArray(body.counties)
      ? [...new Set((body.counties as unknown[]).map(String).filter((c) => counties.some((x) => x.name === c)))]
      : [];
    if (selected.length === 0) return apiError('Pick at least one county.', 'INVALID_COUNTY', 400, id);

    const bankRaw = (body.bankAccount ?? {}) as Record<string, unknown>;
    const bankAccount: BankAccount = {
      bankName: String(bankRaw.bankName ?? '').trim().slice(0, 120),
      accountName: String(bankRaw.accountName ?? '').trim().slice(0, 120),
      accountNumber: String(bankRaw.accountNumber ?? '').trim().slice(0, 80),
      branch: String(bankRaw.branch ?? '').trim().slice(0, 120),
      paybill: String(bankRaw.paybill ?? '').trim().slice(0, 30) || undefined,
    };

    const agency = await updateAgencyProfile(auth.agency.id, {
      ...auth.agency,
      name,
      email,
      phone,
      whatsapp: String(body.whatsapp ?? auth.agency.whatsapp).trim().slice(0, 30),
      bio,
      counties: selected,
      logoUrl: String(body.logoUrl ?? auth.agency.logoUrl).trim().slice(0, 2048) || auth.agency.logoUrl,
      coverUrl: String(body.coverUrl ?? auth.agency.coverUrl).trim().slice(0, 2048) || auth.agency.coverUrl,
      bankAccount: bankAccount.bankName && bankAccount.accountNumber ? bankAccount : auth.agency.bankAccount,
    });
    return json({ agency }, {}, id);
  } catch (error) {
    return handleApiError(error, id);
  }
}
