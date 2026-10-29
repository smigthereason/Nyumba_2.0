import { redirect } from 'next/navigation';

import { AuthBrand, OnboardingForm } from '@/components/auth-forms';
import { getCurrentAgency } from '@/lib/session';
import { FirstVisitSplash } from '@/components/first-visit-splash';

export default async function OnboardingPage() {
  if (await getCurrentAgency()) redirect('/dashboard');

  return (
    <div className="auth-page flex min-h-screen flex-col bg-[#f8f9f6] lg:flex-row">
      <FirstVisitSplash />
      <AuthBrand kicker="Set up your agency profile and put your next property in front of people looking for a place to call home." />
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-9 lg:px-12 lg:py-16">
        <div className="auth-card w-full max-w-[450px] rounded-[26px] border border-line/70 bg-white px-6 py-9 shadow-[0_24px_80px_rgba(25,50,35,.06)] sm:px-10 sm:py-11">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-primary">Join Nyumba</p>
          <h1 className="text-[30px] font-bold tracking-[-0.045em] sm:text-[34px]">List your agency</h1>
          <p className="mb-8 mt-2 text-sm leading-6 text-muted">Create your account in two simple steps.</p>
          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
