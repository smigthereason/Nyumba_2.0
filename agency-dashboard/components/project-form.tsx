'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button, Card, ErrorBanner, Field, Input, Select, Textarea } from '@/components/ui';
import { counties } from '@/lib/mock/locations';
import { PROPERTY_TYPES, type UpcomingProject } from '@/lib/types';

export function ProjectForm({ project }: { project?: UpcomingProject }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
    imageUrl: project?.imageUrl ?? '',
    county: project?.county ?? 'Nairobi',
    estate: project?.estate ?? 'Kilimani',
    priceFromKes: project ? String(project.priceFromKes) : '',
    completionLabel: project?.completionLabel ?? '',
    unitsLeft: project?.unitsLeft != null ? String(project.unitsLeft) : '',
    propertyType: project?.propertyType ?? ('apartment' as UpcomingProject['propertyType']),
  });

  const estates = useMemo(
    () => counties.find((c) => c.name === form.county)?.estates ?? [],
    [form.county]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const url = project ? `/api/projects/${project.id}` : '/api/projects';
    const res = await fetch(url, {
      method: project ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        priceFromKes: Number(form.priceFromKes),
        unitsLeft: form.unitsLeft ? Number(form.unitsLeft) : undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? 'Could not save project.');
      return;
    }
    router.replace('/dashboard/projects');
    router.refresh();
  }

  async function onDelete() {
    if (!project) return;
    if (!confirm('Remove this upcoming project?')) return;
    setBusy(true);
    const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) return;
    router.replace('/dashboard/projects');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <ErrorBanner>{error}</ErrorBanner>
      <Card className="space-y-4 p-5 sm:p-6">
        <Field label="Project name">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <Field label="Cover photo URL">
          <Input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="County">
            <Select
              value={form.county}
              onChange={(e) => {
                const county = e.target.value;
                const estate = counties.find((c) => c.name === county)?.estates[0] ?? '';
                setForm({ ...form, county, estate });
              }}
            >
              {counties.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Estate">
            <Select
              value={form.estate}
              onChange={(e) => setForm({ ...form, estate: e.target.value })}
            >
              {estates.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Price from (KES)">
            <Input
              type="number"
              min={0}
              value={form.priceFromKes}
              onChange={(e) => setForm({ ...form, priceFromKes: e.target.value })}
              required
            />
          </Field>
          <Field label="Type">
            <Select
              value={form.propertyType}
              onChange={(e) =>
                setForm({
                  ...form,
                  propertyType: e.target.value as UpcomingProject['propertyType'],
                })
              }
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Completion">
            <Input
              value={form.completionLabel}
              onChange={(e) => setForm({ ...form, completionLabel: e.target.value })}
              placeholder="Completion Q4 2026"
              required
            />
          </Field>
          <Field label="Units left">
            <Input
              type="number"
              min={0}
              value={form.unitsLeft}
              onChange={(e) => setForm({ ...form, unitsLeft: e.target.value })}
            />
          </Field>
        </div>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : project ? 'Save project' : 'Publish project'}
        </Button>
        <Button href="/dashboard/projects" variant="secondary">
          Cancel
        </Button>
        {project ? (
          <Button type="button" variant="danger" onClick={onDelete} disabled={busy}>
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
