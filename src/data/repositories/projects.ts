import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { upcomingProjects as mockProjects } from '../mock/projects';
import { UpcomingProject } from '../types';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function map(row: any): UpcomingProject {
  return {
    id: String(row.id),
    agencyId: String(row.agency_id),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    county: String(row.county ?? ''),
    estate: String(row.estate ?? ''),
    imageUrl: String(row.image_url ?? ''),
    priceFromKes: Number(row.price_from_kes ?? 0),
    completionLabel: String(row.completion_label ?? ''),
    unitsLeft: row.units_left == null ? undefined : Number(row.units_left),
    propertyType: row.property_type,
  };
}

export async function getUpcomingProjects(county?: string): Promise<UpcomingProject[]> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client is unavailable.');
    let query = supabase.from('upcoming_projects').select('*');
    if (county) query = query.eq('county', county);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(24);
    if (error) throw new Error(`Unable to load projects: ${error.message}`);
    return (data ?? []).map(map);
  }
  await delay();
  return county ? mockProjects.filter((p) => p.county === county) : mockProjects;
}

export async function getUpcomingProjectById(id: string): Promise<UpcomingProject | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client is unavailable.');
    const { data, error } = await supabase.from('upcoming_projects').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Unable to load project: ${error.message}`);
    return data ? map(data) : null;
  }
  await delay(100);
  return mockProjects.find((p) => p.id === id) ?? null;
}
