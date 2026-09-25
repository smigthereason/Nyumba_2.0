import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

export async function fetchRemoteFavoriteIds(userId: string): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('property_id')
    .eq('user_id', userId);

  if (error || !data) {
    console.warn('[nyumba] favorites fetch:', error?.message);
    return [];
  }
  return data.map((r) => r.property_id);
}

export async function addRemoteFavorite(userId: string, propertyId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured) return false;

  const { error } = await supabase.from('favorites').upsert({
    user_id: userId,
    property_id: propertyId,
  });
  if (error) {
    console.warn('[nyumba] favorite add:', error.message);
    return false;
  }
  return true;
}

export async function removeRemoteFavorite(
  userId: string,
  propertyId: string
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured) return false;

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId);

  if (error) {
    console.warn('[nyumba] favorite remove:', error.message);
    return false;
  }
  return true;
}
