'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type InputHTMLAttributes } from 'react';

import { Button, ErrorBanner, Field, Input, Textarea } from '@/components/ui';
import { counties } from '@/lib/mock/locations';

/** Photographic brand panel shared by sign-in and onboarding. */
export function AuthBrand({ kicker }: { kicker: string }) {
  return (
    <aside className="relative isolate flex min-h-[245px] shrink-0 flex-col justify-between overflow-hidden bg-[#104f3e] p-7 text-white sm:min-h-[285px] sm:p-9 lg:min-h-screen lg:w-[48%] lg:p-12 xl:p-16">
      <div
        aria-hidden="true"
        className="auth-hero-image absolute inset-0 bg-cover bg-center lg:bg-[center_45%]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(5,38,31,.62) 0%, rgba(5,46,35,.36) 42%, rgba(2,39,30,.88) 100%), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&h=1700&fit=crop&auto=format&q=85'), url('/auth-architecture.svg')",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b6e4f]/10" />
      <div className="auth-brand-entrance relative z-10 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-black/10">
          <Image src="/Nyumba-Logo.png" alt="Nyumba logo" width={38} height={38} priority />
        </span>
        <div>
          <p className="text-lg font-bold tracking-tight">nyumba<span className="font-medium text-white/75">.</span></p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">For agencies</p>
        </div>
      </div>
      <div className="auth-brand-entrance auth-brand-entrance-delayed relative z-10 mt-10 max-w-lg lg:mb-6">
        <span className="inline-flex rounded-full border border-white/35 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] backdrop-blur-md">
          A better way to list
        </span>
        <h2 className="mt-4 max-w-md text-[32px] font-bold leading-[1.13] tracking-[-0.045em] sm:text-4xl xl:text-[52px]">
          Great spaces deserve to be discovered.
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-6 text-white/85 sm:text-[15px]">{kicker}</p>
      </div>
      <div className="auth-brand-entrance auth-brand-entrance-delayed relative z-10 hidden items-center gap-3 rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-xl lg:flex">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl">⌂</span>
        <div>
          <p className="text-sm font-bold">Your next opportunity starts here.</p>
          <p className="mt-0.5 text-xs text-white/75">Showcase properties. Connect with buyers. Grow with Nyumba.</p>
        </div>
      </div>
    </aside>
  );
}

/** Accessible show/hide password control, including keyboard and screen reader labels. */
export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={`pr-12 ${props.className ?? ''}`} />
      <button
        type="button"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
        className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg text-muted transition-colors duration-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
      >
        {visible ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.7 5.2c.42-.09.85-.13 1.3-.13 5.1 0 9 6.93 9 6.93a16.3 16.3 0 0 1-3.1 3.6M6.2 6.3C3.9 8.1 3 12 3 12s3.9 7 9 7a8.5 8.5 0 0 0 3.1-.6" />
            <path strokeLinecap="round" d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

/** Guest entry does not send credentials and receives a read-only session cookie. */
function GuestButton({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterGuest() {
    setWorking(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      if (!res.ok) throw new Error('Guest preview is unavailable right now.');
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the preview.');
      setWorking(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs font-medium text-faint">
        <div className="h-px flex-1 bg-line" />or explore first<div className="h-px flex-1 bg-line" />
      </div>
      <Button type="button" variant="secondary" onClick={enterGuest} disabled={disabled || working} className="auth-cta w-full border-primary/20 py-3 text-primary-dark hover:bg-primary-soft">
        {working ? 'Opening preview…' : 'Continue as guest'}
        {!working && <span aria-hidden="true">→</span>}
      </Button>
      <p className="text-center text-xs leading-5 text-faint">Preview sample listings and leads. No account required; changes are disabled.</p>
      <ErrorBanner>{error}</ErrorBanner>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not sign in.');
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        <ErrorBanner>{error}</ErrorBanner>
        <Field label="Work email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@youragency.co.ke" required />
        </Field>
        <Field label="Password">
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" required />
        </Field>
        <Button type="submit" className="auth-cta w-full py-3" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in to dashboard'}
        </Button>
      </form>
      <GuestButton disabled={busy} />
      <p className="text-center text-sm text-muted">
        New agency?{' '}
        <Link href="/onboarding" className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>
    </div>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', bio: '', counties: [] as string[],
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
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not create the agency.');
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the agency.');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-faint">Step {step} of 2</p>
        <ErrorBanner>{error}</ErrorBanner>
        {step === 1 ? (
          <div className="auth-step-content space-y-5" key="agency-details">
            <Field label="Agency name"><Input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="organization" placeholder="Your agency name" required /></Field>
            <Field label="Work email"><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" placeholder="you@youragency.co.ke" required /></Field>
            <Field label="Phone"><Input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder="+254 7XX XXX XXX" required /></Field>
            <Field label="Password"><PasswordInput value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" placeholder="At least 10 characters" required minLength={10} /></Field>
          </div>
        ) : (
          <div className="auth-step-content space-y-5" key="agency-coverage">
            <Field label="Counties you cover">
              <div className="flex flex-wrap gap-2">
                {counties.map((c) => {
                  const on = form.counties.includes(c.name);
                  return (
                    <button key={c.id} type="button" aria-pressed={on} onClick={() => toggleCounty(c.name)} className={on ? 'rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-white' : 'rounded-full bg-bg px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink'}>{c.name}</button>
                  );
                })}
              </div>
            </Field>
            <Field label="Short bio" hint="Buyers see this on your storefront.">
              <Textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Premium homes across Nairobi…" />
            </Field>
          </div>
        )}
        <div className="flex gap-2">
          {step === 2 && <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>}
          <Button type="submit" className="auth-cta flex-1 py-3" disabled={busy}>
            {step === 1 ? 'Continue' : busy ? 'Creating…' : 'Create agency'}
          </Button>
        </div>
      </form>
      <GuestButton disabled={busy} />
      <p className="text-center text-sm text-muted">Already listed?{' '}<Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
    </div>
  );
}
