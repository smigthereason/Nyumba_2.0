import { ListingForm } from '@/components/listing-form';
import { PageHeader } from '@/components/ui';

export default function NewListingPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="New listing" subtitle="Three short sections. You can add more details later." />
      <ListingForm />
    </div>
  );
}
