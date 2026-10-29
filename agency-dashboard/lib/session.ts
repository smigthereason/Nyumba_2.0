import { NextResponse } from 'next/server';

import { getSessionAgencyId } from '@/lib/auth';
import { getAgencyById } from '@/lib/db';
import { GUEST_AGENCY_ID } from '@/lib/guest-id';
import type { Agency } from '@/lib/types';

export async function getCurrentAgency(): Promise<Agency | null> {
  const id = await getSessionAgencyId();
  if (!id) return null;
  return getAgencyById(id);
}

export async function requireApiAgency(): Promise<
  { agency: Agency; error?: undefined } | { agency?: undefined; error: NextResponse }
> {
  const agency = await getCurrentAgency();
  if (!agency) {
    return { error: NextResponse.json({ error: 'Please sign in.' }, { status: 401 }) };
  }
  return { agency };
}

/** Call in every mutation handler; read handlers use requireApiAgency(). */
export async function requireWritableApiAgency(): ReturnType<typeof requireApiAgency> {
  const auth = await requireApiAgency();
  if (auth.agency?.id === GUEST_AGENCY_ID) {
    return {
      error: NextResponse.json(
        { error: 'Guest preview is read-only. Create an agency account to make changes.', code: 'GUEST_READ_ONLY' },
        { status: 403 }
      ),
    };
  }
  return auth;
}
