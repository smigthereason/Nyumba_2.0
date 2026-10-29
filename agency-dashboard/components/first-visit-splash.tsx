'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'nyumba:agency:splash:v2:seen';
const SPLASH_TOTAL_MS = 5000;
const SPLASH_EXIT_MS = 750;
const REDUCED_MOTION_MS = 350;

type SplashPhase = 'hidden' | 'visible' | 'exiting';

/** A five-second first-visit brand reveal, then a fade-up into the auth page. */
export function FirstVisitSplash() {
  const [phase, setPhase] = useState<SplashPhase>('hidden');
  // React Strict Mode reruns effects in development. Keep the timers attached on
  // the second effect pass even after the session key has been written.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      try {
        if (sessionStorage.getItem(SESSION_KEY)) return;
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // Blocked storage must not prevent login or onboarding.
      }
      hasStarted.current = true;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = reducedMotion ? REDUCED_MOTION_MS : SPLASH_TOTAL_MS;
    setPhase('visible');

    const exitTimer = window.setTimeout(
      () => setPhase('exiting'),
      reducedMotion ? total : total - SPLASH_EXIT_MS,
    );
    const hideTimer = window.setTimeout(() => setPhase('hidden'), total);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div
      className={`splash-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f7f9f5] px-6 text-center ${phase === 'exiting' ? 'splash-exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Nyumba"
      aria-hidden={phase === 'exiting'}
    >
      <div className="splash-logo flex h-[112px] w-[112px] items-center justify-center rounded-[28px] bg-white shadow-[0_12px_65px_rgba(4,69,46,.14)]">
        <Image src="/Nyumba-Logo.png" alt="Nyumba" width={90} height={90} priority />
      </div>
      <p className="mt-6 text-3xl font-extrabold tracking-[-0.06em] text-primary">nyumba<span className="text-accent">.</span></p>
      <p className="mt-2 text-sm font-medium text-muted">A place to call home.</p>
      <div className="mt-8 h-1 w-24 overflow-hidden rounded-full bg-primary/10" aria-hidden="true">
        <div className="splash-progress h-full w-full origin-left rounded-full bg-primary" />
      </div>
    </div>
  );
}
