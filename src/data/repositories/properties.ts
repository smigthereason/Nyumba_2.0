import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

import { mapProperty } from '../mappers';
import { properties as mockProperties } from '../mock/properties';
import { Property, PropertyFilters } from '../types';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function page(filters: PropertyFilters) {
  const limit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(filters.limit ?? DEFAULT_LIMIT)));
  const offset = Math.max(0, Math.min(10_000, Math.floor(filters.offset ?? 0)));
  return { limit, offset };
}

function filterMock(list: Property[], filters: PropertyFilters): Property[] {
  let result = list.filter((p) => p.status === 'active');
  if (filters.agencyId) result = result.filter((p) => p.agencyId === filters.agencyId);
  if (filters.county) result = result.filter((p) => p.county === filters.county);
  if (filters.estate) result = result.filter((p) => p.estate === filters.estate);
  if (filters.transactionType && filters.transactionType !== 'all') result = result.filter((p) => p.transactionType === filters.transactionType);
  if (filters.propertyType && filters.propertyType !== 'all') result = result.filter((p) => p.propertyType === filters.propertyType);
  if (filters.minPrice != null) result = result.filter((p) => p.priceKes >= filters.minPrice!);
  if (filters.maxPrice != null) result = result.filter((p) => p.priceKes <= filters.maxPrice!);
  if (filters.bedrooms != null && filters.bedrooms > 0) result = result.filter((p) => p.bedrooms >= filters.bedrooms!);
  if (filters.bathrooms != null && filters.bathrooms > 0) result = result.filter((p) => p.bathrooms >= filters.bathrooms!);
  if (filters.featuredOnly) result = result.filter((p) => p.featured);
  if (filters.amenities?.length) result = result.filter((p) => filters.amenities!.every((a) => p.amenities.includes(a)));
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter((p) =>
      p.title.toLowerCase().includes(q) || p.estate.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) || p.county.toLowerCase().includes(q) ||
      p.propertyType.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  const { limit, offset } = page(filters);
  return result.sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt)).slice(offset, offset + limit);
}

function safeSearch(value: string): string {
  return value.trim().slice(0, 100).replace(/[,%()]/g, ' ');
}

async function getPropertiesFromSupabase(filters: PropertyFilters): Promise<Property[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase client is unavailable.');
  const { limit, offset } = page(filters);

  let query = supabase.from('properties').select('*').eq('status', 'active');
  if (filters.agencyId) query = query.eq('agency_id', filters.agencyId);
  if (filters.county) query = query.eq('county', filters.county);
  if (filters.estate) query = query.eq('estate', filters.estate);
  if (filters.transactionType && filters.transactionType !== 'all') query = query.eq('transaction_type', filters.transactionType);
  if (filters.propertyType && filters.propertyType !== 'all') query = query.eq('property_type', filters.propertyType);
  if (filters.minPrice != null) query = query.gte('price_kes', filters.minPrice);
  if (filters.maxPrice != null) query = query.lte('price_kes', filters.maxPrice);
  if (filters.bedrooms != null && filters.bedrooms > 0) query = query.gte('bedrooms', filters.bedrooms);
  if (filters.bathrooms != null && filters.bathrooms > 0) query = query.gte('bathrooms', filters.bathrooms);
  if (filters.featuredOnly) query = query.eq('featured', true);
  if (filters.amenities?.length) query = query.contains('amenities', filters.amenities);
  if (filters.query?.trim()) {
    const q = safeSearch(filters.query);
    query = query.or(`title.ilike.%${q}%,estate.ilike.%${q}%,city.ilike.%${q}%,county.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const { data, error } = await query
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(`Unable to load properties: ${error.message}`);
  return (data ?? []).map(mapProperty);
}

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  if (isSupabaseConfigured) return getPropertiesFromSupabase(filters);
  await delay();
  return filterMock(mockProperties, filters);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client is unavailable.');
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).eq('status', 'active').maybeSingle();
    if (error) throw new Error(`Unable to load property: ${error.message}`);
    return data ? mapProperty(data) : null;
  }
  await delay(80);
  return mockProperties.find((p) => p.id === id) ?? null;
}

export async function getFeaturedProperties(county?: string): Promise<Property[]> {
  return getProperties({ featuredOnly: true, county });
}

export async function getPropertiesByAgency(agencyId: string, filters: Omit<PropertyFilters, 'agencyId'> = {}): Promise<Property[]> {
  return getProperties({ ...filters, agencyId });
}
