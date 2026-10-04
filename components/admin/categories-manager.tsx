'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SingleImageField } from './image-manager';
import { api } from './upload';

type Cat = { id: string; name: string; slug: string; description: string | null; imageUrl: string | null; imagePublicId: string | null; sortOrder: number; isPublished: boolean; _count: { products: number } };
type Form = { id?: string; name: string; slug: string; description: string; imageUrl: string; imagePublicId: string | null; sortOrder: number; isPublished: boolean };

const empty = (n: number): Form => ({ name: '', slug: '', description: '', imageUrl: '', imagePublicId: null, sortOrder: n, isPublished: true });

export function CategoriesManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const { id, ...body } = form;
      await api(id ? `/api/admin/categories/${id}` : '/api/admin/categories', id ? 'PUT' : 'POST', body);
      toast.success('Category saved — live on the website');
      setForm(null);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Cat) => {
    if (!confirm(`Delete "${c.name}"? Its ${c._count.products} product(s) will remain but without a category.`)) return;
    try {
      await api(`/api/admin/categories/${c.id}`, 'DELETE');
      toast.success('Category deleted');
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setForm(empty(initial.length + 1))} data-testid="add-category-btn" className="inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-sm text-ivory">
          <Plus className="h-4 w-4" /> Add category
        </button>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">The first 3 published categories (by display order) appear as the main cards on the homepage.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="categories-list">
        {initial.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-md border bg-white" data-testid="category-row">
            <div className="relative aspect-[16/9] bg-cream">
              {c.imageUrl && <Image src={c.imageUrl} alt="" fill sizes="400px" className="object-cover" />}
              <span className="absolute left-2 top-2 rounded-sm bg-white/90 px-2 py-0.5 text-xs">#{c.sortOrder}</span>
              {!c.isPublished && <span className="absolute right-2 top-2 rounded-sm bg-charcoal px-2 py-0.5 text-xs text-ivory">Hidden</span>}
            </div>
            <div className="flex items-center justify-between gap-2 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug} · {c._count.products} products</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setForm({ id: c.id, name: c.name, slug: c.slug, description: c.description || '', imageUrl: c.imageUrl || '', imagePublicId: c.imagePublicId, sortOrder: c.sortOrder, isPublished: c.isPublished })} aria-label="Edit" data-testid="category-edit" className="rounded-md p-2 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(c)} aria-label="Delete" data-testid="category-delete" className="rounded-md p-2 text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!form} onOpenChange={(o: boolean) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-serif text-2xl font-normal">{form?.id ? 'Edit category' : 'New category'}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-4" data-testid="category-form">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} className="mt-1.5" data-testid="cf-name" />
              </div>
              <div>
                <Label>URL slug</Label>
                <Input value={form.slug} onChange={(e: any) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" className="mt-1.5" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="mb-1.5 block">Image</Label>
                <SingleImageField kind="category" value={form.imageUrl} onChange={(img) => setForm({ ...form, imageUrl: img?.url || '', imagePublicId: img?.publicId || null })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Display order</Label>
                  <Input type="number" min={0} value={form.sortOrder} onChange={(e: any) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="mt-1.5" data-testid="cf-order" />
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm"><Switch checked={form.isPublished} onCheckedChange={(c: boolean) => setForm({ ...form, isPublished: c })} /> Published</label>
              </div>
              <button onClick={save} disabled={saving || form.name.trim().length < 2} data-testid="cf-save" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-maroon text-sm text-ivory disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save category
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
