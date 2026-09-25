import { SettingsForm } from '@/components/settings-form';
import { PageHeader } from '@/components/ui';
import { getCurrentAgency } from '@/lib/session';

export default async function SettingsPage() {
  const agency = await getCurrentAgency();
  if (!agency) return null;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Settings"
        subtitle="Your storefront and the bank account buyers pay."
      />
      <SettingsForm agency={agency} />
    </div>
  );
}
