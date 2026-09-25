import { notFound } from 'next/navigation';

import { ListingForm } from '@/components/listing-form';
import { PageHeader } from '@/components/ui';
import { getAgencyListing } from '@/lib/db';
import { getCurrentAgency } from '@/lib/session';

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const agency = await getCurrentAgency();
  if (!agency) return null;
  const { id } = await params;
  const listing = await getAgencyListing(agency.id, id);
  if (!listing) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Edit listing" subtitle={listing.title} />
      <ListingForm listing={listing} />
    </div>
  );
}
