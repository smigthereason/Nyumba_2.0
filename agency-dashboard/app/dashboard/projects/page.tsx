import { ProjectCard } from '@/components/property-card';
import { Button, EmptyState, PageHeader } from '@/components/ui';
import { listAgencyProjects } from '@/lib/db';
import { getCurrentAgency } from '@/lib/session';

export default async function ProjectsPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;
  const projects = await listAgencyProjects(agency.id, 100);

  return (
    <div>
      <PageHeader
        title="Upcoming projects"
        subtitle="These appear above Rent / Buy on Discover in the Nyumba app."
        action={<Button href="/dashboard/projects/new">Add project</Button>}
      />
      {projects.length === 0 ? (
        <EmptyState
          title="No upcoming projects"
          body="Add a development and buyers will see it on Discover."
          action={<Button href="/dashboard/projects/new">Add project</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              href={`/dashboard/projects/${project.id}/edit`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
