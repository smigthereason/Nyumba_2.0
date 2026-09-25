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

async function postToBackend(input: CreateLeadInput): Promise<{ ok: boolean; error?: string } | null> {
  const base = (process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_AGENCY_API_URL)?.replace(/\/$/, '');
  if (!base) return null;
  try {
    const response = await fetch(`${base}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    if (!response.ok) return { ok: false, error: String(payload?.error ?? 'Unable to send request.') };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error. Please try again.' };
  }
}

export async function createLead(input: CreateLeadInput): Promise<{ ok: boolean; error?: string }> {
  const apiResult = await postToBackend(input);
  if (apiResult) return apiResult;

  if (!isSupabaseConfigured) return { ok: true };
  if (!input.userId) return { ok: false, error: 'Public lead API is not configured.' };

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
