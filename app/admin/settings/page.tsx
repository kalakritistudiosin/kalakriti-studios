import { getSettings } from '@/lib/queries';
import { PageTitle } from '@/components/admin/admin-nav';
import { SettingsForm } from '@/components/admin/settings-form';

export default async function AdminSettingsPage() {
  const s = await getSettings();
  return (
    <>
      <PageTitle title="Settings" text="Business contact details and homepage hero." />
      <SettingsForm
        initial={{
          whatsappNumber: s.whatsappNumber,
          instagramUrl: s.instagramUrl,
          email: s.email,
          heroTitle: s.heroTitle,
          heroSubtitle: s.heroSubtitle,
          heroImage: s.heroImage,
          heroImagePublicId: s.heroImagePublicId,
          heroCtaLabel: s.heroCtaLabel,
          heroCtaHref: s.heroCtaHref,
        }}
      />
    </>
  );
}
