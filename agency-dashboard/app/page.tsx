import { redirect } from 'next/navigation';

import { getCurrentAgency } from '@/lib/session';

export default async function HomePage() {
  const agency = await getCurrentAgency();
  redirect(agency ? '/dashboard' : '/login');
}
