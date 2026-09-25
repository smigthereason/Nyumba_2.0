import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

import { mapAgency } from '../mappers';
import { agencies as mockAgencies } from '../mock/agencies';
import { properties as mockProperties } from '../mock/properties';
import { Agency, AgencyFilters } from '../types';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

function page(filters: AgencyFilters) {
  const limit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(filters.limit ?? DEFAULT_LIMIT)));
  const offset = Math.max(0, Math.min(10_000, Math.floor(filters.offset ?? 0)));
  return { limit, offset };
}

function withListingCounts(list: Agency[]): Agency[] {
  return list.map((agency) => ({
    ...agency,
    listingCount: mockProperties.filter(
      (p) => p.agencyId === agency.id && p.status === 'active'
    ).length,
  }));
}

function filterMock(list: Agency[], filters: AgencyFilters): Agency[] {
  let result = withListingCounts(list);
  if (filters.county) result = result.filter((a) => a.counties.includes(filters.county!));
  if (filters.verifiedOnly) result = result.filter((a) => a.verified);
  if (filters.featuredOnly) result = result.filter((a) => a.featured);
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.bio.toLowerCase().includes(q) ||
        a.counties.some((c) => c.toLowerCase().includes(q))
    );
  }
  const { limit, offset } = page(filters);
  return result.sort((a, b) => b.rating - a.rating).slice(offset, offset + limit);
}

async function getAgenciesFromSupabase(filters: AgencyFilters): Promise<Agency[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is unavailable.');
  const { limit, offset } = page(filters);

  const { data, error } = await supabase.rpc('agencies_with_listing_count', {
    p_county: filters.county ?? null,
    p_featured_only: Boolean(filters.featuredOnly),
    p_verified_only: Boolean(filters.verifiedOnly),
    p_search: filters.query?.trim().slice(0, 100) || null,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw new Error(`Unable to load agencies: ${error.message}`);
  return (data ?? []).map((row: any) => mapAgency(row));
}

export async function getAgencies(filters: AgencyFilters = {}): Promise<Agency[]> {
  if (isSupabaseConfigured) return getAgenciesFromSupabase(filters);
  await delay();
  return filterMock(mockAgencies, filters);
}

export async function getAgencyById(id: string): Promise<Agency | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client is unavailable.');
    const { data, error } = await supabase.from('agencies').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Unable to load agency: ${error.message}`);
    if (!data) return null;
    const { count, error: countError } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', id)
      .eq('status', 'active');
    if (countError) throw new Error(`Unable to load agency listing count: ${countError.message}`);
    return mapAgency({ ...data, listing_count: count ?? 0 });
  }
  await delay(80);
  const agency = mockAgencies.find((a) => a.id === id);
  if (!agency) return null;
  return withListingCounts([agency])[0];
}

export async function getFeaturedAgencies(county?: string): Promise<Agency[]> {
  return getAgencies({ featuredOnly: true, county });
}
