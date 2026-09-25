'use client';

import { useMemo, useState } from 'react';

import { Button, Card, EmptyState, Pill } from '@/components/ui';
import { telLink, timeAgo, waLink } from '@/lib/format';
import type { Lead, LeadStatus, Property } from '@/lib/types';

const FILTERS: { id: 'new' | 'all' | 'contacted' | 'closed'; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'all', label: 'All' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'closed', label: 'Closed' },
];

export function LeadsInbox({
  leads,
  listings,
}: {
  leads: Lead[];
  listings: Property[];
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('new');
  const [openId, setOpenId] = useState<string | null>(leads.find((l) => l.status === 'new')?.id ?? null);
  const [rows, setRows] = useState(leads);

  const titles = useMemo(() => {
    const map = new Map(listings.map((p) => [p.id, p.title]));
    return map;
  }, [listings]);

  const shown = rows.filter((l) => (filter === 'all' ? true : l.status === filter));

  async function setStatus(id: string, status: LeadStatus) {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { lead: Lead };
    setRows((list) => list.map((l) => (l.id === id ? data.lead : l)));
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads yet"
        body="When a buyer requests a viewing or sends a purchase invoice, it lands here."
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
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
            {f.id === 'new' ? ` (${rows.filter((l) => l.status === 'new').length})` : ''}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState title="Inbox is clear" body="No leads in this filter." />
      ) : (
        <div className="space-y-3">
          {shown.map((lead) => {
            const open = openId === lead.id;
            const call = telLink(lead.phone);
            const wa = waLink(lead.phone);
            return (
              <Card key={lead.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : lead.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{lead.name || 'Buyer'}</p>
                    <p className="truncate text-sm text-muted">
                      {titles.get(lead.propertyId) ?? 'Listing'} · {timeAgo(lead.createdAt)}
                    </p>
                  </div>
                  <Pill tone={lead.type === 'purchase' ? 'accent' : 'green'}>
                    {lead.type === 'purchase' ? 'Purchase' : 'Viewing'}
                  </Pill>
                  <Pill
                    tone={
                      lead.status === 'new' ? 'gold' : lead.status === 'closed' ? 'muted' : 'green'
                    }
                  >
                    {lead.status}
                  </Pill>
                </button>
                {open ? (
                  <div className="space-y-4 border-t border-line px-5 py-4">
                    <p className="text-sm leading-relaxed text-ink">{lead.message}</p>
                    {lead.phone ? (
                      <p className="text-sm text-muted">{lead.phone}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {lead.status !== 'contacted' ? (
                        <Button type="button" onClick={() => setStatus(lead.id, 'contacted')}>
                          Mark contacted
                        </Button>
                      ) : null}
                      {lead.status !== 'closed' ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setStatus(lead.id, 'closed')}
                        >
                          Mark closed
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setStatus(lead.id, 'new')}
                        >
                          Reopen
                        </Button>
                      )}
                      {call ? (
                        <Button href={call} variant="ghost">
                          Call
                        </Button>
                      ) : null}
                      {wa ? (
                        <Button href={wa} variant="ghost">
                          WhatsApp
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
