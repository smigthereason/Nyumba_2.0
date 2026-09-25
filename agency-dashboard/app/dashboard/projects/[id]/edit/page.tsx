import { notFound } from 'next/navigation';

import { ProjectForm } from '@/components/project-form';
import { PageHeader } from '@/components/ui';
import { getAgencyProject } from '@/lib/db';
import { getCurrentAgency } from '@/lib/session';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const agency = await getCurrentAgency();
  if (!agency) return null;
  const { id } = await params;
  const project = await getAgencyProject(agency.id, id);
  if (!project) notFound();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Edit project" subtitle={project.name} />
      <ProjectForm project={project} />
    </div>
  );
}
