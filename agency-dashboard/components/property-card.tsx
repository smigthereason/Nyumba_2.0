import Link from 'next/link';

import { Pill } from '@/components/ui';
import { formatKes, labelType } from '@/lib/format';
import type { Property, PropertyStatus, TransactionType, UpcomingProject } from '@/lib/types';

function statusTone(status: PropertyStatus) {
  if (status === 'active') return 'green' as const;
  if (status === 'pending') return 'gold' as const;
  return 'muted' as const;
}

export function PropertyCard({ listing }: { listing: Property }) {
  const img = listing.images[0];
  const price =
    listing.transactionType === 'rent'
      ? `${formatKes(listing.priceKes)} / ${listing.rentPeriod === 'year' ? 'yr' : 'mo'}`
      : formatKes(listing.priceKes);

  return (
    <Link
      href={`/dashboard/listings/${listing.id}/edit`}
      className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30"
    >
      <div className="relative aspect-[16/10] bg-primary-soft">
        {img ? (
          <img src={img} alt="" className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Pill tone={listing.transactionType === 'sale' ? 'accent' : 'green'}>
            {listing.transactionType === 'sale' ? 'Sale' : 'Rent'}
          </Pill>
          <Pill tone={statusTone(listing.status)}>{labelType(listing.status)}</Pill>
        </div>
        {listing.featured ? (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-white">
            Featured
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <p className="line-clamp-1 font-semibold text-ink group-hover:text-primary">{listing.title}</p>
        <p className="mt-0.5 text-sm text-muted">
          {listing.estate}, {listing.county}
        </p>
        <p className="mt-3 text-base font-bold text-primary">{price}</p>
      </div>
    </Link>
  );
}

export function ProjectCard({
  project,
  href,
}: {
  project: UpcomingProject;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30"
    >
      <div className="relative aspect-[16/10] bg-primary-soft">
        <img src={project.imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <p className="line-clamp-1 font-semibold text-ink group-hover:text-primary">{project.name}</p>
        <p className="mt-0.5 text-sm text-muted">
          {project.estate}, {project.county}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-bold text-primary">From {formatKes(project.priceFromKes)}</span>
          <span className="text-faint">{project.completionLabel}</span>
        </div>
      </div>
    </Link>
  );
}

export function TxPill({ type }: { type: TransactionType }) {
  return (
    <Pill tone={type === 'sale' ? 'accent' : 'green'}>{type === 'sale' ? 'Sale' : 'Rent'}</Pill>
  );
}
