import { redirect } from 'next/navigation';
import { GUEST_AGENCY_ID } from '@/lib/guest-id';
import { getCurrentAgency } from '@/lib/session';
import { ProjectForm } from '@/components/project-form';
import { PageHeader } from '@/components/ui';

export default async function NewProjectPage() {
  const agency = await getCurrentAgency();
  if (agency?.id === GUEST_AGENCY_ID) redirect('/dashboard/projects');
  return (
    <div className="max-w-3xl">
      <PageHeader title="New project" subtitle="A development buyers can watch on Discover." />
      <ProjectForm />
    </div>
  );
}
