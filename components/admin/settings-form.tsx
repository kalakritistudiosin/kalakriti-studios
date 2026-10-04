'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SingleImageField } from './image-manager';
import { api } from './upload';

export type SettingsValue = {
  whatsappNumber: string; instagramUrl: string; email: string;
  heroTitle: string; heroSubtitle: string; heroImage: string; heroImagePublicId: string | null;
  heroCtaLabel: string; heroCtaHref: string;
};

export function SettingsForm({ initial }: { initial: SettingsValue }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof SettingsValue, val: string | null) => setV((s) => ({ ...s, [k]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { settings } = await api<{ settings: SettingsValue }>('/api/admin/settings', 'PUT', v);
      setV({ ...v, whatsappNumber: settings.whatsappNumber });
      toast.success('Settings saved — live on the website');
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const card = 'rounded-md border bg-white p-4 sm:p-6';
  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6" data-testid="settings-form">
      <section className={card}>
        <h2 className="mb-4 font-serif text-xl">Contact & social</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>WhatsApp number</Label>
            <Input value={v.whatsappNumber} onChange={(e: any) => set('whatsappNumber', e.target.value)} placeholder="919876543210" inputMode="tel" className="mt-1.5" data-testid="sf-whatsapp" />
            <p className="mt-1 text-xs text-muted-foreground">With country code, no + or spaces (e.g. 91 for India).</p>
          </div>
          <div>
            <Label>Contact email</Label>
            <Input type="email" value={v.email} onChange={(e: any) => set('email', e.target.value)} className="mt-1.5" data-testid="sf-email" />
          </div>
          <div className="sm:col-span-2">
            <Label>Instagram URL</Label>
            <Input value={v.instagramUrl} onChange={(e: any) => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/kalakritistudios" className="mt-1.5" data-testid="sf-instagram" />
          </div>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-4 font-serif text-xl">Homepage hero</h2>
        <div className="space-y-4">
          <div>
            <Label>Heading</Label>
            <Input value={v.heroTitle} onChange={(e: any) => set('heroTitle', e.target.value)} className="mt-1.5" data-testid="sf-hero-title" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={v.heroSubtitle} onChange={(e: any) => set('heroSubtitle', e.target.value)} className="mt-1.5" data-testid="sf-hero-subtitle" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Button text</Label>
              <Input value={v.heroCtaLabel} onChange={(e: any) => set('heroCtaLabel', e.target.value)} className="mt-1.5" data-testid="sf-cta-label" />
            </div>
            <div>
              <Label>Button link</Label>
              <Input value={v.heroCtaHref} onChange={(e: any) => set('heroCtaHref', e.target.value)} placeholder="/shop" className="mt-1.5" data-testid="sf-cta-href" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Hero image</Label>
            <SingleImageField kind="site" value={v.heroImage} onChange={(img) => setV((s) => ({ ...s, heroImage: img?.url || '', heroImagePublicId: img?.publicId || null }))} testId="sf-hero-image" />
          </div>
        </div>
      </section>

      <button type="submit" disabled={saving} data-testid="sf-save" className="inline-flex h-11 items-center gap-2 rounded-md bg-maroon px-6 text-sm font-medium text-ivory disabled:opacity-60">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save settings
      </button>
    </form>
  );
}
