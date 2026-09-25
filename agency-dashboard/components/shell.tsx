'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { Button, cn } from '@/components/ui';
import type { Agency } from '@/lib/types';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: HomeIcon },
  { href: '/dashboard/listings', label: 'Listings', icon: HomeStackIcon },
  { href: '/dashboard/projects', label: 'Projects', icon: BuildingIcon },
  { href: '/dashboard/leads', label: 'Leads', icon: InboxIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: CogIcon },
];

export function Shell({
  agency,
  newLeadCount,
  children,
}: {
  agency: Agency;
  newLeadCount: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              active
                ? 'bg-primary-soft text-primary-dark'
                : 'text-muted hover:bg-bg hover:text-ink'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.href === '/dashboard/leads' && newLeadCount > 0 ? (
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                {newLeadCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <Image src="/Nyumba-Logo.png" alt="Nyumba" width={36} height={36} />
          <div>
            <p className="text-sm font-bold leading-tight">Nyumba</p>
            <p className="text-[11px] font-medium text-faint">For agencies</p>
          </div>
        </Link>
        {nav}
        <div className="mt-4 border-t border-line pt-4">
          <div className="flex items-center gap-3 px-2">
            <img
              src={agency.logoUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{agency.name}</p>
              <p className="truncate text-xs text-faint">{agency.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="mt-2 w-full justify-start" onClick={logout}>
            Log out
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/Nyumba-Logo.png" alt="Nyumba" width={32} height={32} />
          <span className="text-sm font-bold">Nyumba</span>
        </Link>
        <button
          type="button"
          className="rounded-xl border border-line px-3 py-1.5 text-sm font-semibold"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </header>

      {open ? (
        <div className="border-b border-line bg-surface px-4 py-3 lg:hidden">
          {nav}
          <Button variant="ghost" className="mt-2 w-full justify-start" onClick={logout}>
            Log out
          </Button>
        </div>
      ) : null}

      <main className="px-4 py-6 sm:px-8 lg:ml-[248px] lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function HomeStackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10 12 4l8 6v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M8 16h8" />
    </svg>
  );
}
function InboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 13 6 5h12l2 8v6H4z" />
      <path d="M4 13h4l1.5 2h5L16 13h4" />
    </svg>
  );
}
function CogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.7.9 1.2 1.6 1.4H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
