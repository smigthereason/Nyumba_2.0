import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

import { buildSeed } from '@/lib/seed';
import type {
  Agency,
  AgencyAccount,
  Db,
  Lead,
  LeadStatus,
  Property,
  UpcomingProject,
} from '@/lib/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const PAGE_MAX = 100;

type SupabaseRow = Record<string, unknown>;

let chain: Promise<unknown> = Promise.resolve();

export class DataStoreError extends Error {
  constructor(
    message: string,
    public readonly code = 'DATA_STORE_ERROR',
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'DataStoreError';
  }
}

export function isSupabaseBackendConfigured(): boolean {
  const url = process.env.SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return Boolean(url.startsWith('http') && serviceKey.length > 20);
}

export function backendMode(): 'supabase' | 'local' {
  return isSupabaseBackendConfigured() ? 'supabase' : 'local';
}

export function assertBackendReady(): void {
  if (process.env.NODE_ENV === 'production' && !isSupabaseBackendConfigured()) {
    throw new DataStoreError(
      'Production backend is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      'BACKEND_NOT_CONFIGURED'
    );
  }
}

function supabaseConfig() {
  assertBackendReady();
  const url = process.env.SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) {
    throw new DataStoreError('Supabase backend is not configured.', 'BACKEND_NOT_CONFIGURED');
  }
  return { base: `${url.replace(/\/$/, '')}/rest/v1`, key };
}

async function supabaseRequest<T>(
  pathname: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    prefer?: string;
    headers?: Record<string, string>;
    expectJson?: boolean;
  } = {}
): Promise<{ data: T; response: Response }> {
  const { base, key } = supabaseConfig();
  const url = new URL(`${base}/${pathname.replace(/^\//, '')}`);
  for (const [name, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(name, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.prefer ? { Prefer: options.prefer } : {}),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store',
    });
  } catch (error) {
    throw new DataStoreError('Database is temporarily unreachable.', 'BACKEND_UNAVAILABLE', error);
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      throw new DataStoreError('Database returned an invalid response.', 'BACKEND_INVALID_RESPONSE', error);
    }
  }
  if (!response.ok) {
    const errorPayload: SupabaseRow =
      payload && typeof payload === 'object' && !Array.isArray(payload)
        ? (payload as SupabaseRow)
        : {};
    const code = String(errorPayload.code ?? `HTTP_${response.status}`);
    const message = String(
      errorPayload.message ?? errorPayload.hint ?? `Supabase request failed (${response.status}).`
    );
    throw new DataStoreError(message, code, payload);
  }
  return { data: payload as T, response };
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data } = await supabaseRequest<T>(`rpc/${name}`, { method: 'POST', body: args });
  return data;
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function loadLocal(): Promise<Db> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw) as Db;
  } catch {
    const seeded = await buildSeed();
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

/** Development/demo-only whole-store read. Production code uses scoped functions below. */
export function readDb(): Promise<Db> {
  if (isSupabaseBackendConfigured()) {
    throw new DataStoreError('readDb() is disabled for the production backend.', 'UNBOUNDED_QUERY');
  }
  return enqueue(loadLocal);
}

/** Development/demo-only whole-store mutation. Production code uses scoped functions below. */
export function updateDb(mutator: (db: Db) => void): Promise<Db> {
  if (isSupabaseBackendConfigured()) {
    throw new DataStoreError('updateDb() is disabled for the production backend.', 'UNBOUNDED_MUTATION');
  }
  return enqueue(async () => {
    const db = await loadLocal();
    mutator(db);
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    return db;
  });
}

export function toPublicAgency(account: AgencyAccount, listingCount?: number): Agency {
  const { passwordHash: _ignored, ...rest } = account;
  void _ignored;
  return { ...rest, listingCount: listingCount ?? rest.listingCount };
}

export function listingCountFor(db: Db, agencyId: string): number {
  return db.properties.filter((p) => p.agencyId === agencyId && p.status === 'active').length;
}

function clampLimit(limit = 50): number {
  const safe = Number.isFinite(limit) ? Math.floor(limit) : 50;
  return Math.max(1, Math.min(PAGE_MAX, safe));
}

function safeOffset(offset = 0): number {
  return Number.isFinite(offset) ? Math.max(0, Math.min(10_000, Math.floor(offset))) : 0;
}

function mapAgencyRow(row: SupabaseRow, listingCount = 0): Agency {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    logoUrl: String(row.logo_url ?? ''),
    coverUrl: String(row.cover_url ?? ''),
    bio: String(row.bio ?? ''),
    verified: Boolean(row.verified),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    listingCount: Number(row.listing_count ?? listingCount ?? 0),
    phone: String(row.phone ?? ''),
    whatsapp: String(row.whatsapp ?? ''),
    email: String(row.email ?? ''),
    counties: Array.isArray(row.counties) ? row.counties.map(String) : [],
    yearsActive: Number(row.years_active ?? 0),
    responseRate: Number(row.response_rate ?? 0),
    featured: Boolean(row.featured),
    bankAccount: (row.bank_account ?? undefined) as Agency['bankAccount'],
  };
}

function mapPropertyRow(row: SupabaseRow): Property {
  return {
    id: String(row.id),
    agencyId: String(row.agency_id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    transactionType: row.transaction_type as Property['transactionType'],
    propertyType: row.property_type as Property['propertyType'],
    priceKes: Number(row.price_kes ?? 0),
    rentPeriod: (row.rent_period ?? undefined) as Property['rentPeriod'],
    bedrooms: Number(row.bedrooms ?? 0),
    bathrooms: Number(row.bathrooms ?? 0),
    sqm: row.sqm == null ? undefined : Number(row.sqm),
    parking: row.parking == null ? undefined : Number(row.parking),
    county: String(row.county ?? ''),
    city: String(row.city ?? ''),
    estate: String(row.estate ?? ''),
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    amenities: Array.isArray(row.amenities) ? (row.amenities as Property['amenities']) : [],
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    featured: Boolean(row.featured),
    status: row.status as Property['status'],
    createdAt: String(row.created_at ?? new Date(0).toISOString()),
  };
}

function propertyToRow(property: Property) {
  return {
    id: property.id,
    agency_id: property.agencyId,
    title: property.title,
    description: property.description,
    transaction_type: property.transactionType,
    property_type: property.propertyType,
    price_kes: property.priceKes,
    rent_period: property.rentPeriod ?? null,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqm: property.sqm ?? null,
    parking: property.parking ?? null,
    county: property.county,
    city: property.city,
    estate: property.estate,
    lat: property.lat,
    lng: property.lng,
    amenities: property.amenities,
    images: property.images,
    featured: property.featured,
    status: property.status,
    created_at: property.createdAt,
  };
}

function mapProjectRow(row: SupabaseRow): UpcomingProject {
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
    propertyType: row.property_type as UpcomingProject['propertyType'],
  };
}

function projectToRow(project: UpcomingProject) {
  return {
    id: project.id,
    agency_id: project.agencyId,
    name: project.name,
    description: project.description,
    county: project.county,
    estate: project.estate,
    image_url: project.imageUrl,
    price_from_kes: project.priceFromKes,
    completion_label: project.completionLabel,
    units_left: project.unitsLeft ?? null,
    property_type: project.propertyType,
  };
}

function mapLeadRow(row: SupabaseRow): Lead {
  return {
    id: String(row.id),
    propertyId: String(row.property_id),
    agencyId: String(row.agency_id),
    name: row.name ? String(row.name) : undefined,
    phone: row.phone ? String(row.phone) : undefined,
    message: String(row.message ?? ''),
    type: row.type === 'purchase' ? 'purchase' : 'viewing',
    status: row.status as Lead['status'],
    createdAt: String(row.created_at ?? new Date(0).toISOString()),
  };
}

async function countRows(table: string, filters: Record<string, string>): Promise<number> {
  const { response } = await supabaseRequest<unknown[]>(table, {
    query: { select: 'id', ...filters, limit: 1 },
    prefer: 'count=exact',
  });
  const contentRange = response.headers.get('content-range') ?? '';
  const total = contentRange.split('/')[1];
  return total && total !== '*' ? Number(total) : 0;
}

export async function getAgencyById(id: string): Promise<Agency | null> {
  if (!isSupabaseBackendConfigured()) {
    const db = await readDb();
    const account = db.agencies.find((a) => a.id === id);
    return account ? toPublicAgency(account, listingCountFor(db, id)) : null;
  }
  const [{ data }, listingCount] = await Promise.all([
    supabaseRequest<SupabaseRow[]>('agencies', {
      query: { select: '*', id: `eq.${id}`, limit: 1 },
    }),
    countRows('properties', { agency_id: `eq.${id}`, status: 'eq.active' }),
  ]);
  return data[0] ? mapAgencyRow(data[0], listingCount) : null;
}

export async function findAgencyAccountByEmail(
  email: string
): Promise<{ agency: Agency; passwordHash: string } | null> {
  if (!isSupabaseBackendConfigured()) {
    const db = await readDb();
    const account = db.agencies.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account) return null;
    return {
      agency: toPublicAgency(account, listingCountFor(db, account.id)),
      passwordHash: account.passwordHash,
    };
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('agency_accounts', {
    query: { select: 'agency_id,password_hash', email: `eq.${email.toLowerCase()}`, limit: 1 },
  });
  if (!data[0]) return null;
  const agency = await getAgencyById(String(data[0].agency_id));
  return agency ? { agency, passwordHash: String(data[0].password_hash) } : null;
}

export async function createAgencyAccount(input: {
  agency: Agency;
  passwordHash: string;
}): Promise<Agency> {
  if (!isSupabaseBackendConfigured()) {
    let result: Agency | null = null;
    await updateDb((db) => {
      if (db.agencies.some((a) => a.email.toLowerCase() === input.agency.email.toLowerCase())) {
        throw new DataStoreError('Email already exists.', 'EMAIL_TAKEN');
      }
      const account: AgencyAccount = { ...input.agency, passwordHash: input.passwordHash };
      db.agencies.push(account);
      result = toPublicAgency(account, 0);
    });
    return result!;
  }

  const agencyRow = {
    id: input.agency.id,
    name: input.agency.name,
    slug: input.agency.slug,
    logo_url: input.agency.logoUrl,
    cover_url: input.agency.coverUrl,
    bio: input.agency.bio,
    verified: input.agency.verified,
    rating: input.agency.rating,
    review_count: input.agency.reviewCount,
    phone: input.agency.phone,
    whatsapp: input.agency.whatsapp,
    email: input.agency.email,
    counties: input.agency.counties,
    years_active: input.agency.yearsActive,
    response_rate: input.agency.responseRate,
    featured: input.agency.featured ?? false,
    bank_account: input.agency.bankAccount ?? null,
  };

  try {
    await rpc<string>('register_agency_account', {
      p_agency: agencyRow,
      p_password_hash: input.passwordHash,
    });
  } catch (error) {
    if (error instanceof DataStoreError && error.code === '23505') {
      throw new DataStoreError('Email already exists.', 'EMAIL_TAKEN', error);
    }
    throw error;
  }
  return input.agency;
}

export async function updateAgencyProfile(agencyId: string, agency: Agency): Promise<Agency> {
  if (!isSupabaseBackendConfigured()) {
    let updated: Agency | null = null;
    await updateDb((db) => {
      const account = db.agencies.find((a) => a.id === agencyId);
      if (!account) throw new DataStoreError('Agency not found.', 'NOT_FOUND');
      if (db.agencies.some((a) => a.id !== agencyId && a.email.toLowerCase() === agency.email.toLowerCase())) {
        throw new DataStoreError('Email already exists.', 'EMAIL_TAKEN');
      }
      Object.assign(account, agency);
      updated = toPublicAgency(account, listingCountFor(db, agencyId));
    });
    return updated!;
  }
  try {
    await rpc<void>('update_agency_profile', {
      p_agency_id: agencyId,
      p_profile: {
        name: agency.name,
        email: agency.email,
        phone: agency.phone,
        whatsapp: agency.whatsapp,
        bio: agency.bio,
        counties: agency.counties,
        logo_url: agency.logoUrl,
        cover_url: agency.coverUrl,
        bank_account: agency.bankAccount ?? null,
      },
    });
  } catch (error) {
    if (error instanceof DataStoreError && error.code === '23505') {
      throw new DataStoreError('Email already exists.', 'EMAIL_TAKEN', error);
    }
    if (error instanceof DataStoreError && error.code === 'P0002') {
      throw new DataStoreError('Agency not found.', 'NOT_FOUND', error);
    }
    throw error;
  }
  const updated = await getAgencyById(agencyId);
  if (!updated) throw new DataStoreError('Agency not found.', 'NOT_FOUND');
  return updated;
}

export async function listAgencyListings(
  agencyId: string,
  limit = 100,
  offset = 0
): Promise<Property[]> {
  if (!isSupabaseBackendConfigured()) {
    const db = await readDb();
    return db.properties
      .filter((p) => p.agencyId === agencyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(safeOffset(offset), safeOffset(offset) + clampLimit(limit));
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('properties', {
    query: {
      select: '*',
      agency_id: `eq.${agencyId}`,
      order: 'created_at.desc',
      limit: clampLimit(limit),
      offset: safeOffset(offset),
    },
  });
  return data.map(mapPropertyRow);
}

export async function getAgencyListing(agencyId: string, id: string): Promise<Property | null> {
  if (!isSupabaseBackendConfigured()) {
    const db = await readDb();
    return db.properties.find((p) => p.id === id && p.agencyId === agencyId) ?? null;
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('properties', {
    query: { select: '*', agency_id: `eq.${agencyId}`, id: `eq.${id}`, limit: 1 },
  });
  return data[0] ? mapPropertyRow(data[0]) : null;
}

export async function createAgencyListing(property: Property): Promise<Property> {
  if (!isSupabaseBackendConfigured()) {
    await updateDb((db) => db.properties.unshift(property));
    return property;
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('properties', {
    method: 'POST',
    body: propertyToRow(property),
    prefer: 'return=representation',
  });
  if (!data[0]) throw new DataStoreError('Create listing returned no data.');
  return mapPropertyRow(data[0]);
}

export async function updateAgencyListing(property: Property): Promise<Property> {
  if (!isSupabaseBackendConfigured()) {
    await updateDb((db) => {
      const i = db.properties.findIndex((p) => p.id === property.id && p.agencyId === property.agencyId);
      if (i < 0) throw new DataStoreError('Listing not found.', 'NOT_FOUND');
      db.properties[i] = property;
    });
    return property;
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('properties', {
    method: 'PATCH',
    query: { id: `eq.${property.id}`, agency_id: `eq.${property.agencyId}` },
    body: propertyToRow(property),
    prefer: 'return=representation',
  });
  if (!data[0]) throw new DataStoreError('Listing not found.', 'NOT_FOUND');
  return mapPropertyRow(data[0]);
}

export async function deleteAgencyListing(agencyId: string, id: string): Promise<boolean> {
  if (!isSupabaseBackendConfigured()) {
    let found = false;
    await updateDb((db) => {
      const before = db.properties.length;
      db.properties = db.properties.filter((p) => !(p.id === id && p.agencyId === agencyId));
      found = before !== db.properties.length;
    });
    return found;
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('properties', {
    method: 'DELETE',
    query: { id: `eq.${id}`, agency_id: `eq.${agencyId}` },
    prefer: 'return=representation',
  });
  return Boolean(data[0]);
}

export async function listAgencyProjects(
  agencyId: string,
  limit = 100,
  offset = 0
): Promise<UpcomingProject[]> {
  if (!isSupabaseBackendConfigured()) {
    const db = await readDb();
    return db.projects
      .filter((p) => p.agencyId === agencyId)
      .slice(safeOffset(offset), safeOffset(offset) + clampLimit(limit));
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('upcoming_projects', {
    query: {
      select: '*',
      agency_id: `eq.${agencyId}`,
      order: 'created_at.desc',
      limit: clampLimit(limit),
      offset: safeOffset(offset),
    },
  });
  return data.map(mapProjectRow);
}

export async function getAgencyProject(agencyId: string, id: string): Promise<UpcomingProject | null> {
  if (!isSupabaseBackendConfigured()) {
    const db = await readDb();
    return db.projects.find((p) => p.id === id && p.agencyId === agencyId) ?? null;
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('upcoming_projects', {
    query: { select: '*', agency_id: `eq.${agencyId}`, id: `eq.${id}`, limit: 1 },
  });
  return data[0] ? mapProjectRow(data[0]) : null;
}

export async function createAgencyProject(project: UpcomingProject): Promise<UpcomingProject> {
  if (!isSupabaseBackendConfigured()) {
    await updateDb((db) => db.projects.unshift(project));
    return project;
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('upcoming_projects', {
    method: 'POST',
    body: projectToRow(project),
    prefer: 'return=representation',
  });
  if (!data[0]) throw new DataStoreError('Create project returned no data.');
  return mapProjectRow(data[0]);
}

export async function updateAgencyProject(project: UpcomingProject): Promise<UpcomingProject> {
  if (!isSupabaseBackendConfigured()) {
    await updateDb((db) => {
      const i = db.projects.findIndex((p) => p.id === project.id && p.agencyId === project.agencyId);
      if (i < 0) throw new DataStoreError('Project not found.', 'NOT_FOUND');
      db.projects[i] = project;
    });
    return project;
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('upcoming_projects', {
    method: 'PATCH',
    query: { id: `eq.${project.id}`, agency_id: `eq.${project.agencyId}` },
    body: projectToRow(project),
    prefer: 'return=representation',
  });
  if (!data[0]) throw new DataStoreError('Project not found.', 'NOT_FOUND');
  return mapProjectRow(data[0]);
}

export async function deleteAgencyProject(agencyId: string, id: string): Promise<boolean> {
  if (!isSupabaseBackendConfigured()) {
    let found = false;
    await updateDb((db) => {
      const before = db.projects.length;
      db.projects = db.projects.filter((p) => !(p.id === id && p.agencyId === agencyId));
      found = before !== db.projects.length;
    });
    return found;
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('upcoming_projects', {
    method: 'DELETE',
    query: { id: `eq.${id}`, agency_id: `eq.${agencyId}` },
    prefer: 'return=representation',
  });
  return Boolean(data[0]);
}

export async function listAgencyLeads(
  agencyId: string,
  limit = 100,
  offset = 0
): Promise<Lead[]> {
  if (!isSupabaseBackendConfigured()) {
    const db = await readDb();
    return db.leads
      .filter((l) => l.agencyId === agencyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(safeOffset(offset), safeOffset(offset) + clampLimit(limit));
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('leads', {
    query: {
      select: '*',
      agency_id: `eq.${agencyId}`,
      order: 'created_at.desc',
      limit: clampLimit(limit),
      offset: safeOffset(offset),
    },
  });
  return data.map(mapLeadRow);
}

export async function countNewLeads(agencyId: string): Promise<number> {
  if (!isSupabaseBackendConfigured()) {
    const db = await readDb();
    return db.leads.filter((l) => l.agencyId === agencyId && l.status === 'new').length;
  }
  return countRows('leads', { agency_id: `eq.${agencyId}`, status: 'eq.new' });
}

export async function updateAgencyLeadStatus(
  agencyId: string,
  id: string,
  status: LeadStatus
): Promise<Lead | null> {
  if (!isSupabaseBackendConfigured()) {
    let lead: Lead | null = null;
    await updateDb((db) => {
      const found = db.leads.find((l) => l.id === id && l.agencyId === agencyId);
      if (found) {
        found.status = status;
        lead = found;
      }
    });
    return lead;
  }
  const { data } = await supabaseRequest<SupabaseRow[]>('leads', {
    method: 'PATCH',
    query: { id: `eq.${id}`, agency_id: `eq.${agencyId}` },
    body: { status },
    prefer: 'return=representation',
  });
  return data[0] ? mapLeadRow(data[0]) : null;
}

export async function createPublicLead(
  input: Omit<Lead, 'id' | 'createdAt' | 'status'> & { userId?: string | null }
): Promise<Lead> {
  if (!isSupabaseBackendConfigured()) {
    const lead: Lead = {
      propertyId: input.propertyId,
      agencyId: input.agencyId,
      name: input.name,
      phone: input.phone,
      message: input.message,
      type: input.type,
      id: `lead-${randomUUID()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    await updateDb((db) => {
      const agency = db.agencies.find((a) => a.id === input.agencyId);
      const property = db.properties.find(
        (p) => p.id === input.propertyId && p.agencyId === input.agencyId && p.status === 'active'
      );
      if (!agency || !property) throw new DataStoreError('Unknown listing.', 'NOT_FOUND');
      db.leads.unshift(lead);
    });
    return lead;
  }

  const { data: propertyRows } = await supabaseRequest<SupabaseRow[]>('properties', {
    query: {
      select: 'id,agency_id,status',
      id: `eq.${input.propertyId}`,
      agency_id: `eq.${input.agencyId}`,
      status: 'eq.active',
      limit: 1,
    },
  });
  if (!propertyRows[0]) throw new DataStoreError('Unknown listing.', 'NOT_FOUND');

  const { data } = await supabaseRequest<SupabaseRow[]>('leads', {
    method: 'POST',
    body: {
      property_id: input.propertyId,
      agency_id: input.agencyId,
      user_id: input.userId ?? null,
      name: input.name ?? null,
      phone: input.phone ?? null,
      message: input.message,
      type: input.type,
      status: 'new',
    },
    prefer: 'return=representation',
  });
  if (!data[0]) throw new DataStoreError('Create lead returned no data.');
  return mapLeadRow(data[0]);
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  if (!isSupabaseBackendConfigured()) {
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(Date.now() + windowSeconds * 1000).toISOString(),
    };
  }
  const data = await rpc<SupabaseRow[]>('consume_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  const row = data[0] ?? {};
  return {
    allowed: Boolean(row.allowed),
    remaining: Number(row.remaining ?? 0),
    resetAt: String(row.reset_at ?? new Date(Date.now() + windowSeconds * 1000).toISOString()),
  };
}

export async function checkBackendHealth(): Promise<{
  mode: 'supabase' | 'local';
  database: 'ok';
}> {
  if (!isSupabaseBackendConfigured()) {
    await readDb();
    return { mode: 'local', database: 'ok' };
  }
  await supabaseRequest<SupabaseRow[]>('agencies', {
    query: { select: 'id', limit: 1 },
  });
  return { mode: 'supabase', database: 'ok' };
}
