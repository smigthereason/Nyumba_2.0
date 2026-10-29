/**
 * Public, read-only showcase data. Guest sessions never query or write Supabase.
 * Keep this identity outside the range of real agency IDs.
 */
import { GUEST_AGENCY_ID } from '@/lib/guest-id';
import { agencies } from '@/lib/mock/agencies';
import { upcomingProjects } from '@/lib/mock/projects';
import { properties } from '@/lib/mock/properties';
import type { Agency, Lead, Property, UpcomingProject } from '@/lib/types';

const SAMPLE_AGENCY_ID = 'agency-1';

export const guestAgency: Agency = {
  ...agencies[0],
  id: GUEST_AGENCY_ID,
  name: 'Nyumba Showcase Agency',
  slug: 'nyumba-showcase',
  email: 'guest@example.invalid',
  phone: '',
  whatsapp: '',
  bankAccount: undefined,
  verified: false,
  listingCount: properties.filter((p) => p.agencyId === SAMPLE_AGENCY_ID && p.status === 'active').length,
};

export const guestListings: Property[] = properties
  .filter((p) => p.agencyId === SAMPLE_AGENCY_ID)
  .map((p) => ({ ...p, agencyId: GUEST_AGENCY_ID }));

export const guestProjects: UpcomingProject[] = upcomingProjects
  .filter((p) => p.agencyId === SAMPLE_AGENCY_ID)
  .map((p) => ({ ...p, agencyId: GUEST_AGENCY_ID }));

export function guestLeads(): Lead[] {
  const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();
  return [
    {
      id: 'guest-lead-1',
      agencyId: GUEST_AGENCY_ID,
      propertyId: 'prop-1',
      name: 'Sample Buyer',
      phone: undefined,
      message: 'Example enquiry: Is this property available for a viewing this weekend?',
      type: 'viewing',
      status: 'new',
      createdAt: hoursAgo(2),
    },
    {
      id: 'guest-lead-2',
      agencyId: GUEST_AGENCY_ID,
      propertyId: 'prop-2',
      name: 'Example Customer',
      phone: undefined,
      message: 'Example enquiry: Please share more details about the property.',
      type: 'purchase',
      status: 'contacted',
      createdAt: hoursAgo(29),
    },
  ];
}

export function guestPage<T>(items: T[], limit: number, offset: number): T[] {
  const start = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
  const count = Number.isFinite(limit) ? Math.min(100, Math.max(0, Math.floor(limit))) : 50;
  return items.slice(start, start + count);
}
