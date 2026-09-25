import { ProjectForm } from '@/components/project-form';
import { PageHeader } from '@/components/ui';

export default function NewProjectPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="New project" subtitle="A development buyers can watch on Discover." />
      <ProjectForm />
    </div>
  );
}
