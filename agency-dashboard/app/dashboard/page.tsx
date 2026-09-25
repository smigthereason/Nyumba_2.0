import Link from 'next/link';

import { PropertyCard } from '@/components/property-card';
import { Button, Card, EmptyState, PageHeader, Pill } from '@/components/ui';
import { listAgencyLeads, listAgencyListings } from '@/lib/db';
import { timeAgo } from '@/lib/format';
import { getCurrentAgency } from '@/lib/session';

export default async function OverviewPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;
  const [listings, leads] = await Promise.all([
    listAgencyListings(agency.id, 100),
    listAgencyLeads(agency.id, 100),
  ]);
  const fresh = leads.filter((l) => l.status === 'new');
  const titles = new Map(listings.map((p) => [p.id, p.title]));

  const kpis = [
    { label: 'Listings', value: listings.length },
    { label: 'New leads', value: fresh.length },
    { label: 'For sale', value: listings.filter((p) => p.transactionType === 'sale').length },
    { label: 'For rent', value: listings.filter((p) => p.transactionType === 'rent').length },
  ];

  return (
    <div>
      <PageHeader
        title={`Hi, ${agency.name.split(' ')[0]}`}
        subtitle="A quiet place to list homes and answer buyers."
        action={<Button href="/dashboard/listings/new">Add listing</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-faint">{k.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{k.value}</p>
          </Card>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Needs a reply</h2>
          <Link href="/dashboard/leads" className="text-sm font-semibold text-primary">
            Open inbox
          </Link>
        </div>
        {fresh.length === 0 ? (
          <EmptyState title="You’re caught up" body="New viewing and purchase requests will show up here." />
        ) : (
          <div className="space-y-3">
            {fresh.slice(0, 5).map((lead) => (
              <Link key={lead.id} href="/dashboard/leads">
                <Card className="flex items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{lead.name || 'Buyer'}</p>
                    <p className="truncate text-sm text-muted">
                      {titles.get(lead.propertyId) ?? 'Listing'} · {timeAgo(lead.createdAt)}
                    </p>
                  </div>
                  <Pill tone={lead.type === 'purchase' ? 'accent' : 'green'}>
                    {lead.type === 'purchase' ? 'Purchase' : 'Viewing'}
                  </Pill>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent listings</h2>
          <Link href="/dashboard/listings" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        {listings.length === 0 ? (
          <EmptyState
            title="No listings yet"
            body="Publish a home and it appears here and in the Nyumba app mock storefront."
            action={<Button href="/dashboard/listings/new">Add listing</Button>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.slice(0, 6).map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
