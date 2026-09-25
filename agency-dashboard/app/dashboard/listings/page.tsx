import { ListingsBoard } from '@/components/listings-board';
import { Button, PageHeader } from '@/components/ui';
import { listAgencyListings } from '@/lib/db';
import { getCurrentAgency } from '@/lib/session';

export default async function ListingsPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;
  const listings = await listAgencyListings(agency.id, 100);

  return (
    <div>
      <PageHeader
        title="Listings"
        subtitle="Homes buyers can rent or buy from your storefront."
        action={<Button href="/dashboard/listings/new">Add listing</Button>}
      />
      <ListingsBoard listings={listings} />
    </div>
  );
}
