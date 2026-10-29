import { redirect } from 'next/navigation';
import { GUEST_AGENCY_ID } from '@/lib/guest-id';
import { getCurrentAgency } from '@/lib/session';
import { ListingForm } from '@/components/listing-form';
import { PageHeader } from '@/components/ui';

export default async function NewListingPage() {
  const agency = await getCurrentAgency();
  if (agency?.id === GUEST_AGENCY_ID) redirect('/dashboard/listings');
  return (
    <div className="max-w-3xl">
      <PageHeader title="New listing" subtitle="Three short sections. You can add more details later." />
      <ListingForm />
    </div>
  );
}
