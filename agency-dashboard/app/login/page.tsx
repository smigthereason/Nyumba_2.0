import { redirect } from 'next/navigation';

import { AuthBrand, LoginForm } from '@/components/auth-forms';
import { getCurrentAgency } from '@/lib/session';

export default async function LoginPage() {
  if (await getCurrentAgency()) redirect('/dashboard');

  return (
    <div className="flex min-h-screen">
      <AuthBrand kicker="Sign in to list homes, reply to viewing requests, and share your bank details with buyers." />
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 mb-8 text-sm text-muted">Use your agency email to continue.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
