import Image from 'next/image';

import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Image src="/Nyumba-Logo.png" alt="Nyumba" width={56} height={56} />
      <h1 className="mt-6 text-2xl font-bold">This page isn’t listed</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The link is missing or the home was taken down. Head back to your dashboard.
      </p>
      <Button href="/dashboard" className="mt-6">
        Back home
      </Button>
    </div>
  );
}
