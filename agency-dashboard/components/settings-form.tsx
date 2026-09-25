'use client';

import { useState } from 'react';

import { Button, Card, ErrorBanner, Field, Input, Textarea } from '@/components/ui';
import { counties } from '@/lib/mock/locations';
import type { Agency, BankAccount } from '@/lib/types';

export function SettingsForm({ agency }: { agency: Agency }) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: agency.name,
    email: agency.email,
    phone: agency.phone,
    whatsapp: agency.whatsapp,
    bio: agency.bio,
    logoUrl: agency.logoUrl,
    coverUrl: agency.coverUrl,
    counties: agency.counties,
    bankName: agency.bankAccount?.bankName ?? '',
    accountName: agency.bankAccount?.accountName ?? '',
    accountNumber: agency.bankAccount?.accountNumber ?? '',
    branch: agency.bankAccount?.branch ?? '',
    paybill: agency.bankAccount?.paybill ?? '',
  });

  function toggleCounty(name: string) {
    setForm((f) => ({
      ...f,
      counties: f.counties.includes(name)
        ? f.counties.filter((c) => c !== name)
        : [...f.counties, name],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(false);
    const bankAccount: BankAccount = {
      bankName: form.bankName,
      accountName: form.accountName,
      accountNumber: form.accountNumber,
      branch: form.branch,
      paybill: form.paybill || undefined,
    };
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        bio: form.bio,
        logoUrl: form.logoUrl,
        coverUrl: form.coverUrl,
        counties: form.counties,
        bankAccount,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? 'Could not save.');
      return;
    }
    setOk(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <ErrorBanner>{error}</ErrorBanner>
      {ok ? (
        <div className="rounded-xl border border-primary/20 bg-primary-soft px-3.5 py-2.5 text-sm text-primary-dark">
          Saved. Buyers will see these details on your storefront and invoice.
        </div>
      ) : null}

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-bold">Storefront</h2>
        <Field label="Agency name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Bio">
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="WhatsApp">
            <Input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </Field>
          <Field label="Logo URL">
            <Input
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Cover URL">
          <Input
            value={form.coverUrl}
            onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
          />
        </Field>
        <Field label="Counties">
          <div className="flex flex-wrap gap-2">
            {counties.map((c) => {
              const on = form.counties.includes(c.name);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCounty(c.name)}
                  className={
                    on
                      ? 'rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-white'
                      : 'rounded-full bg-bg px-3 py-1.5 text-sm font-semibold text-muted'
                  }
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </Field>
      </Card>

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-bold">Bank details</h2>
        <p className="text-sm text-muted">
          Buyers copy this when they request to buy a house. Nyumba never holds the money.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bank">
            <Input
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            />
          </Field>
          <Field label="Account name">
            <Input
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            />
          </Field>
          <Field label="Account number">
            <Input
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            />
          </Field>
          <Field label="Branch">
            <Input
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
            />
          </Field>
          <Field label="M-Pesa Paybill">
            <Input
              value={form.paybill}
              onChange={(e) => setForm({ ...form, paybill: e.target.value })}
            />
          </Field>
        </div>
        <div className="rounded-2xl border border-primary bg-primary-soft p-4">
          <p className="text-sm font-semibold text-primary-dark">What buyers see</p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Bank" value={form.bankName || '—'} />
            <Row label="Account name" value={form.accountName || '—'} />
            <Row label="Account number" value={form.accountNumber || '—'} />
            <Row label="Branch" value={form.branch || '—'} />
            {form.paybill ? <Row label="M-Pesa Paybill" value={form.paybill} last /> : null}
          </dl>
        </div>
      </Card>

      <Button type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save settings'}
      </Button>
    </form>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-1.5 ${last ? '' : 'border-b border-primary/15'}`}
    >
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}
