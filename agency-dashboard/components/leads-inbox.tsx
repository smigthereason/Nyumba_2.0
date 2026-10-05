'use client';

import { useMemo, useState } from 'react';

import { Button, Card, EmptyState, Pill } from '@/components/ui';
import { smsLink, telLink, timeAgo, waLink } from '@/lib/format';
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
        body="When a buyer requests a viewing or sends a purchase enquiry, it lands here."
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
            const text = smsLink(lead.phone);
            const wa = waLink(lead.phone);
            return (
              <Card key={lead.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : lead.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-bg/70"
                  aria-expanded={open}
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
                  <div className="space-y-5 border-t border-line px-5 py-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-faint">Request</p>
                      <p className="mt-1 text-sm leading-relaxed text-ink">{lead.message}</p>
                    </div>

                    <div className="rounded-xl border border-line bg-bg px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-faint">Contact buyer</p>
                      {lead.phone ? (
                        <>
                          <p className="mt-1 font-semibold text-ink">{lead.phone}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {call ? <Button href={call}>Call</Button> : null}
                            {text ? <Button href={text} variant="secondary">Text</Button> : null}
                            {wa ? <Button href={wa} variant="secondary">WhatsApp</Button> : null}
                          </div>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-muted">
                          This older request has no phone number. New viewing requests require one.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-faint">
                        Lead status
                      </span>
                      {lead.status !== 'contacted' ? (
                        <Button type="button" variant="secondary" onClick={() => setStatus(lead.id, 'contacted')}>
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
