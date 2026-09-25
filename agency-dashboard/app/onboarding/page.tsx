import { redirect } from 'next/navigation';

import { AuthBrand, OnboardingForm } from '@/components/auth-forms';
import { getCurrentAgency } from '@/lib/session';

export default async function OnboardingPage() {
  if (await getCurrentAgency()) redirect('/dashboard');

  return (
    <div className="flex min-h-screen">
      <AuthBrand kicker="Two short steps. Then you can publish listings Kenya buyers already browse in the Nyumba app." />
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">List your agency</h1>
          <p className="mt-1 mb-8 text-sm text-muted">Takes about a minute.</p>
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
