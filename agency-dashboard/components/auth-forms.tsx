'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, ErrorBanner, Field, Input, Textarea } from '@/components/ui';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo';
import { counties } from '@/lib/mock/locations';

export function AuthBrand({ kicker }: { kicker: string }) {
  return (
    <div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
      <div className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-black/10" />
      <div className="relative">
        <Image src="/Nyumba-Logo.png" alt="Nyumba" width={48} height={48} className="rounded-xl bg-white p-1" />
        <p className="mt-8 text-3xl font-bold leading-tight text-white">Nyumba for agencies</p>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/80">{kicker}</p>
      </div>
      <p className="relative text-sm text-white/70">Kenya’s storefront for trusted real estate agencies.</p>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? 'Could not sign in.');
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBanner>{error}</ErrorBanner>
      <Field label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>
      <Field label="Password">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Field>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-center text-sm text-muted">
        New agency?{' '}
        <Link href="/onboarding" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
      <p className="text-center text-xs text-faint">
        Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
      </p>
    </form>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    bio: '',
    counties: [] as string[],
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

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
    if (step === 1) {
      if (form.name.trim().length < 2) return setError('Enter your agency name.');
      if (!form.email.includes('@')) return setError('Enter a valid email.');
      if (form.phone.length < 7) return setError('Enter a phone number.');
      if (form.password.length < 10) return setError('Password must be at least 10 characters.');
      setError(null);
      setStep(2);
      return;
    }
    if (form.counties.length === 0) return setError('Pick at least one county.');
    setBusy(true);
    setError(null);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? 'Could not create the agency.');
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-faint">
        Step {step} of 2
      </p>
      <ErrorBanner>{error}</ErrorBanner>
      {step === 1 ? (
        <>
          <Field label="Agency name">
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Work email">
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
              minLength={10}
            />
          </Field>
        </>
      ) : (
        <>
          <Field label="Counties you cover">
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
                        : 'rounded-full bg-bg px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink'
                    }
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Short bio" hint="Buyers see this on your storefront.">
            <Textarea
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Premium homes across Nairobi…"
            />
          </Field>
        </>
      )}
      <div className="flex gap-2">
        {step === 2 ? (
          <Button type="button" variant="secondary" onClick={() => setStep(1)}>
            Back
          </Button>
        ) : null}
        <Button type="submit" className="flex-1" disabled={busy}>
          {step === 1 ? 'Continue' : busy ? 'Creating…' : 'Create agency'}
        </Button>
      </div>
      <p className="text-center text-sm text-muted">
        Already listed?{' '}
        <Link href="/login" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </form>
  );
}
