'use client';

import { useMemo, useState } from 'react';

import { PropertyCard } from '@/components/property-card';
import { Button, EmptyState, Input } from '@/components/ui';
import type { Property } from '@/lib/types';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'rent', label: 'Rent' },
  { id: 'sale', label: 'Sale' },
  { id: 'active', label: 'Active' },
] as const;

export function ListingsBoard({ listings }: { listings: Property[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    return listings.filter((p) => {
      if (filter === 'rent' && p.transactionType !== 'rent') return false;
      if (filter === 'sale' && p.transactionType !== 'sale') return false;
      if (filter === 'active' && p.status !== 'active') return false;
      if (q.trim()) {
        const s = q.trim().toLowerCase();
        return (
          p.title.toLowerCase().includes(s) ||
          p.estate.toLowerCase().includes(s) ||
          p.county.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [listings, filter, q]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={
                filter === f.id
                  ? 'rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-white'
                  : 'rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-muted ring-1 ring-line'
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search estate or title"
          className="sm:max-w-xs"
        />
      </div>
      {shown.length === 0 ? (
        <EmptyState
          title={listings.length === 0 ? 'No listings yet' : 'Nothing matches'}
          body={
            listings.length === 0
              ? 'Add your first home so buyers can find you on Nyumba.'
              : 'Try a different filter or search.'
          }
          action={
            listings.length === 0 ? (
              <Button href="/dashboard/listings/new">Add listing</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
