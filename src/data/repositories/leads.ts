import Constants from 'expo-constants';

import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

export type CreateLeadInput = {
  propertyId: string;
  agencyId: string;
  userId?: string | null;
  name?: string;
  phone?: string;
  message: string;
  type?: 'viewing' | 'purchase';
};

function publicApiBase(): string | null {
  const configured = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_AGENCY_API_URL;
  const appConfig = Constants.expoConfig?.extra?.publicApiUrl;
  const value = configured || (typeof appConfig === 'string' ? appConfig : '');
  return value ? value.replace(/\/$/, '') : null;
}

async function postToBackend(input: CreateLeadInput): Promise<{ ok: boolean; error?: string } | null> {
  const base = publicApiBase();
  if (!base) return null;

  try {
    const supabase = getSupabase();
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

    const response = await fetch(`${base}/api/leads`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        propertyId: input.propertyId,
        agencyId: input.agencyId,
        name: input.name,
        phone: input.phone,
        message: input.message,
        type: input.type ?? 'viewing',
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: String(payload?.error ?? 'Unable to send request.') };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }
}

export async function createLead(input: CreateLeadInput): Promise<{ ok: boolean; error?: string }> {
  const apiResult = await postToBackend(input);
  if (apiResult) return apiResult;

  if (!isSupabaseConfigured) return { ok: true };
  if (!input.userId) {
    return { ok: false, error: 'Viewing requests are temporarily unavailable. Please try again shortly.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Backend is not available.' };
  const { error } = await supabase.from('leads').insert({
    property_id: input.propertyId,
    agency_id: input.agencyId,
    user_id: input.userId,
    name: input.name ?? null,
    phone: input.phone ?? null,
    message: input.message,
    type: input.type ?? 'viewing',
    status: 'new',
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}
