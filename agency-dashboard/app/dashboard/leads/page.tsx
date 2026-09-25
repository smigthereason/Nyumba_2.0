import { LeadsInbox } from '@/components/leads-inbox';
import { PageHeader } from '@/components/ui';
import { listAgencyLeads, listAgencyListings } from '@/lib/db';
import { getCurrentAgency } from '@/lib/session';

export default async function LeadsPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;
  const [leads, listings] = await Promise.all([
    listAgencyLeads(agency.id, 100),
    listAgencyListings(agency.id, 100),
  ]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Leads"
        subtitle="Viewing requests and purchase invoices from the Nyumba app."
      />
      <LeadsInbox leads={leads} listings={listings} />
    </div>
  );
}
