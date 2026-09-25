import { redirect } from 'next/navigation';

import { Shell } from '@/components/shell';
import { countNewLeads } from '@/lib/db';
import { getCurrentAgency } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const agency = await getCurrentAgency();
  if (!agency) redirect('/login');

  const newLeadCount = await countNewLeads(agency.id);

  return (
    <Shell agency={agency} newLeadCount={newLeadCount}>
      {children}
    </Shell>
  );
}
