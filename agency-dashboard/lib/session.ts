import { NextResponse } from 'next/server';

import { getSessionAgencyId } from '@/lib/auth';
import { getAgencyById } from '@/lib/db';
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
