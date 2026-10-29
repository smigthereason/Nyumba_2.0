import { redirect } from 'next/navigation';

import { AuthBrand, LoginForm } from '@/components/auth-forms';
import { getCurrentAgency } from '@/lib/session';
import { FirstVisitSplash } from '@/components/first-visit-splash';

export default async function LoginPage() {
  if (await getCurrentAgency()) redirect('/dashboard');

  return (
    <div className="auth-page flex min-h-screen flex-col bg-[#f8f9f6] lg:flex-row">
      <FirstVisitSplash />
      <AuthBrand kicker="Bring your properties to more buyers and manage everything from one simple workspace." />
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-9 lg:px-12 lg:py-16">
        <div className="auth-card w-full max-w-[450px] rounded-[26px] border border-line/70 bg-white px-6 py-9 shadow-[0_24px_80px_rgba(25,50,35,.06)] sm:px-10 sm:py-11">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-primary">Agency portal</p>
          <h1 className="text-[30px] font-bold tracking-[-0.045em] sm:text-[34px]">Welcome back</h1>
          <p className="mb-8 mt-2 text-sm leading-6 text-muted">Sign in to manage your listings, projects and enquiries.</p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
