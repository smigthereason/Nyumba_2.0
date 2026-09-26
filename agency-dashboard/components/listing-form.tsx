'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Button, Card, ErrorBanner, Field, Input, Select, Textarea } from '@/components/ui';
import { counties } from '@/lib/mock/locations';
import { AMENITIES, PROPERTY_TYPES, type Amenity, type Property } from '@/lib/types';

type FormState = {
  title: string;
  description: string;
  images: string[];
  transactionType: 'rent' | 'sale';
  propertyType: Property['propertyType'];
  priceKes: string;
  rentPeriod: 'month' | 'year';
  bedrooms: string;
  bathrooms: string;
  county: string;
  estate: string;
  amenities: Amenity[];
  status: Property['status'];
  sqm: string;
  parking: string;
  lat: string;
  lng: string;
  featured: boolean;
};

function fromListing(p?: Property): FormState {
  return {
    title: p?.title ?? '',
    description: p?.description ?? '',
    images: p?.images ?? [],
    transactionType: p?.transactionType ?? 'rent',
    propertyType: p?.propertyType ?? 'apartment',
    priceKes: p ? String(p.priceKes) : '',
    rentPeriod: p?.rentPeriod ?? 'month',
    bedrooms: p ? String(p.bedrooms) : '1',
    bathrooms: p ? String(p.bathrooms) : '1',
    county: p?.county ?? 'Nairobi',
    estate: p?.estate ?? 'Kilimani',
    amenities: p?.amenities ?? [],
    status: p?.status ?? 'active',
    sqm: p?.sqm != null ? String(p.sqm) : '',
    parking: p?.parking != null ? String(p.parking) : '',
    lat: p?.lat ? String(p.lat) : '',
    lng: p?.lng ? String(p.lng) : '',
    featured: p?.featured ?? false,
  };
}

export function ListingForm({ listing }: { listing?: Property }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(fromListing(listing));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);
  const [more, setMore] = useState(false);

  const estates = useMemo(
    () => counties.find((c) => c.name === form.county)?.estates ?? [],
    [form.county]
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(a: Amenity) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (form.images.length + selected.length > 20) {
      setError('A listing can contain at most 20 photos.');
      return;
    }

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const maxBytes = 8 * 1024 * 1024;
    const invalid = selected.find((file) => !allowed.has(file.type) || file.size > maxBytes);
    if (invalid) {
      setError(`${invalid.name} must be a JPG, PNG, or WebP image no larger than 8 MB.`);
      return;
    }

    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    try {
      for (let index = 0; index < selected.length; index += 1) {
        const file = selected[index];
        setUploadLabel(`Uploading ${index + 1} of ${selected.length}…`);
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/uploads/property-image', { method: 'POST', body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? `Could not upload ${file.name}.`);
        }
        uploaded.push(String(data.url));
      }
      setForm((current) => ({ ...current, images: [...current.images, ...uploaded] }));
    } catch (uploadError) {
      if (uploaded.length) {
        setForm((current) => ({ ...current, images: [...current.images, ...uploaded] }));
      }
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload images.');
    } finally {
      setUploading(false);
      setUploadLabel(null);
    }
  }

  function removeImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      ...form,
      priceKes: Number(form.priceKes),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sqm: form.sqm ? Number(form.sqm) : undefined,
      parking: form.parking ? Number(form.parking) : undefined,
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
      images: form.images,
    };
    const url = listing ? `/api/listings/${listing.id}` : '/api/listings';
    const res = await fetch(url, {
      method: listing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? 'Could not save listing.');
      return;
    }
    router.replace('/dashboard/listings');
    router.refresh();
  }

  async function onDelete() {
    if (!listing) return;
    if (!confirm('Remove this listing? Buyers will no longer see it here.')) return;
    setBusy(true);
    const res = await fetch(`/api/listings/${listing.id}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not delete.');
      return;
    }
    router.replace('/dashboard/listings');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <ErrorBanner>{error}</ErrorBanner>

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-bold">1. Photos & story</h2>
        <Field label="Title">
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <Field
          label="Property photos"
          hint="Upload JPG, PNG, or WebP images up to 8 MB each. The first photo becomes the cover."
        >
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading || busy || form.images.length >= 20}
            onChange={(e) => {
              void uploadImages(e.target.files);
              e.currentTarget.value = '';
            }}
          />
          {uploading ? (
            <p className="mt-2 text-sm font-medium text-primary">{uploadLabel ?? 'Uploading…'}</p>
          ) : null}
          {form.images.length ? (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.images.map((url, index) => (
                <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-line bg-bg">
                  <div
                    className="aspect-[4/3] bg-cover bg-center"
                    style={{ backgroundImage: `url("${url.replace(/"/g, '%22')}")` }}
                    role="img"
                    aria-label={`Property photo ${index + 1}`}
                  />
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                    <span className="text-xs font-medium text-muted">
                      {index === 0 ? 'Cover photo' : `Photo ${index + 1}`}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-danger"
                      onClick={() => removeImage(index)}
                      disabled={uploading || busy}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">No photos uploaded yet.</p>
          )}
        </Field>
      </Card>

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-bold">2. Price & type</h2>
        <div className="flex gap-2">
          {(['rent', 'sale'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('transactionType', t)}
              className={
                form.transactionType === t
                  ? 'flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white'
                  : 'flex-1 rounded-xl bg-bg py-2.5 text-sm font-semibold text-muted'
              }
            >
              {t === 'rent' ? 'For rent' : 'For sale'}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (KES)">
            <Input
              type="number"
              min={0}
              value={form.priceKes}
              onChange={(e) => set('priceKes', e.target.value)}
              required
            />
          </Field>
          {form.transactionType === 'rent' ? (
            <Field label="Charged">
              <Select
                value={form.rentPeriod}
                onChange={(e) => set('rentPeriod', e.target.value as 'month' | 'year')}
              >
                <option value="month">Per month</option>
                <option value="year">Per year</option>
              </Select>
            </Field>
          ) : (
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => set('status', e.target.value as Property['status'])}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </Select>
            </Field>
          )}
          <Field label="Type">
            <Select
              value={form.propertyType}
              onChange={(e) => set('propertyType', e.target.value as Property['propertyType'])}
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Beds">
              <Input
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(e) => set('bedrooms', e.target.value)}
              />
            </Field>
            <Field label="Baths">
              <Input
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) => set('bathrooms', e.target.value)}
              />
            </Field>
          </div>
        </div>
        {form.transactionType === 'rent' ? (
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(e) => set('status', e.target.value as Property['status'])}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rented">Rented</option>
              <option value="sold">Sold</option>
            </Select>
          </Field>
        ) : null}
      </Card>

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-base font-bold">3. Location & extras</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="County">
            <Select
              value={form.county}
              onChange={(e) => {
                const next = e.target.value;
                const first = counties.find((c) => c.name === next)?.estates[0] ?? '';
                setForm((f) => ({ ...f, county: next, estate: first }));
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
            <Select value={form.estate} onChange={(e) => set('estate', e.target.value)}>
              {estates.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Amenities">
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => {
              const on = form.amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={
                    on
                      ? 'rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary-dark'
                      : 'rounded-full bg-bg px-3 py-1 text-sm font-medium text-muted'
                  }
                >
                  {a}
                </button>
              );
            })}
          </div>
        </Field>
        <button
          type="button"
          className="text-sm font-semibold text-primary"
          onClick={() => setMore((v) => !v)}
        >
          {more ? 'Hide extra details' : 'More details'}
        </button>
        {more ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Size (sqm)">
              <Input value={form.sqm} onChange={(e) => set('sqm', e.target.value)} />
            </Field>
            <Field label="Parking">
              <Input value={form.parking} onChange={(e) => set('parking', e.target.value)} />
            </Field>
            <Field label="Latitude">
              <Input value={form.lat} onChange={(e) => set('lat', e.target.value)} />
            </Field>
            <Field label="Longitude">
              <Input value={form.lng} onChange={(e) => set('lng', e.target.value)} />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              Featured on Discover
            </label>
          </div>
        ) : null}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy || uploading}>
          {uploading ? 'Uploading photos…' : busy ? 'Saving…' : listing ? 'Save listing' : 'Publish listing'}
        </Button>
        <Button href="/dashboard/listings" variant="secondary">
          Cancel
        </Button>
        {listing ? (
          <Button type="button" variant="danger" onClick={onDelete} disabled={busy || uploading}>
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
