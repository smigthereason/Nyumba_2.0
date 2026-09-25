import { hashPassword } from '@/lib/auth';
import { DEMO_PASSWORD } from '@/lib/demo';
import { agencies as mockAgencies } from '@/lib/mock/agencies';
import { upcomingProjects } from '@/lib/mock/projects';
import { properties as mockProperties } from '@/lib/mock/properties';
import type { Db, Lead } from '@/lib/types';

export { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo';

export async function buildSeed(): Promise<Db> {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const agencies = mockAgencies.map((a) => ({ ...a, passwordHash }));

  const hours = (n: number) => new Date(Date.now() - n * 3600_000).toISOString();

  const leads: Lead[] = [
    {
      id: 'lead-1',
      propertyId: 'prop-1',
      agencyId: 'agency-1',
      name: 'Amina Wanjiku',
      phone: '+254712000111',
      message: 'Viewing request for "Bright 2BR Apartment in Kilimani" (KES 95,000 / month)',
      type: 'viewing',
      status: 'new',
      createdAt: hours(1),
    },
    {
      id: 'lead-2',
      propertyId: 'prop-4',
      agencyId: 'agency-1',
      name: 'David Otieno',
      phone: '+254722000222',
      message: 'Purchase request for "4BR Family Home for Sale — Lavington". Ready to pay the 10% deposit.',
      type: 'purchase',
      status: 'new',
      createdAt: hours(5),
    },
    {
      id: 'lead-3',
      propertyId: 'prop-2',
      agencyId: 'agency-1',
      name: 'Grace Mwangi',
      phone: '+254733000333',
      message: 'Viewing request for "Executive 3BR Maisonette — Westlands". Weekend preferred.',
      type: 'viewing',
      status: 'contacted',
      createdAt: hours(26),
    },
    {
      id: 'lead-4',
      propertyId: 'prop-5',
      agencyId: 'agency-2',
      name: 'Hassan Ali',
      phone: '+254700000444',
      message: 'Viewing request for "Nyali Beachfront 3BR Apartment".',
      type: 'viewing',
      status: 'new',
      createdAt: hours(3),
    },
    {
      id: 'lead-5',
      propertyId: 'prop-11',
      agencyId: 'agency-4',
      name: 'Priya Shah',
      phone: '+254711000555',
      message: 'Purchase request for "Karen Luxury 5BR Bungalow". Please send the invoice.',
      type: 'purchase',
      status: 'new',
      createdAt: hours(8),
    },
    {
      id: 'lead-6',
      propertyId: 'prop-18',
      agencyId: 'agency-7',
      name: 'Brian Kimani',
      phone: '+254713000666',
      message: 'Viewing request for "Studio Loft — Upper Hill".',
      type: 'viewing',
      status: 'closed',
      createdAt: hours(72),
    },
  ];

  return {
    agencies,
    properties: mockProperties,
    projects: upcomingProjects,
    leads,
  };
}
