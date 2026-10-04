'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageManager } from './image-manager';
import { api, type UploadedImage } from './upload';
import { discountPercent, formatINR, slugify, type StockStatusT } from '@/lib/format';

export type ProductFormValue = {
  id?: string;
  name: string;
  slug: string;
  code: string;
  shortDescription: string;
  description: string;
  categoryId: string | null;
  tags: string[];
  mrp: number | string;
  offerPrice: number | string;
  stockStatus: StockStatusT;
  isFeatured: boolean;
  isPublished: boolean;
  isCustomizable: boolean;
  images: UploadedImage[];
};

const EMPTY: ProductFormValue = {
  name: '', slug: '', code: '', shortDescription: '', description: '', categoryId: null, tags: [],
  mrp: '', offerPrice: '', stockStatus: 'IN_STOCK', isFeatured: false, isPublished: true, isCustomizable: false, images: [],
};

export function ProductForm({ initial, categories, allTags }: { initial?: ProductFormValue; categories: { id: string; name: string }[]; allTags: string[] }) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValue>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const set = <K extends keyof ProductFormValue>(k: K, val: ProductFormValue[K]) => setV((s) => ({ ...s, [k]: val }));
  const off = discountPercent(Number(v.mrp) || 0, Number(v.offerPrice) || 0);
  const suggestions = useMemo(
    () => allTags.filter((t) => !v.tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())).slice(0, 8),
    [allTags, v.tags, tagInput]
  );

  const addTag = (t: string) => {
    const n = t.trim();
    if (n && !v.tags.some((x) => x.toLowerCase() === n.toLowerCase())) set('tags', [...v.tags, n]);
    setTagInput('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...v, mrp: Number(v.mrp), offerPrice: Number(v.offerPrice), slug: v.slug || '' };
      if (v.id) await api(`/api/admin/products/${v.id}`, 'PUT', body);
      else await api('/api/admin/products', 'POST', body);
      toast.success(v.id ? 'Product updated — live on the website' : 'Product created — live on the website');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!v.id || !confirm(`Delete "${v.name}"? This also deletes its images.`)) return;
    try {
      await api(`/api/admin/products/${v.id}`, 'DELETE');
      toast.success('Product deleted');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const card = 'rounded-md border bg-white p-4 sm:p-6';

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]" data-testid="product-form">
      <div className="space-y-6">
        <section className={card}>
          <h2 className="mb-4 font-serif text-xl">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Product name *</Label>
              <Input id="name" required value={v.name} onChange={(e: any) => set('name', e.target.value)} className="mt-1.5" data-testid="pf-name" />
            </div>
            <div>
              <Label htmlFor="code">Product code / SKU *</Label>
              <Input id="code" required value={v.code} onChange={(e: any) => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9-_]/g, ''))} placeholder="KS-RK-001" className="mt-1.5 font-mono" data-testid="pf-code" />
            </div>
            <div>
              <Label htmlFor="slug">URL slug</Label>
              <Input id="slug" value={v.slug} onChange={(e: any) => set('slug', slugify(e.target.value))} placeholder={slugify(v.name) || 'auto-from-name'} className="mt-1.5" data-testid="pf-slug" />
              <p className="mt-1 truncate text-xs text-muted-foreground">/products/{v.slug || slugify(v.name) || '…'}</p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="short">Short description *</Label>
              <Input id="short" required maxLength={240} value={v.shortDescription} onChange={(e: any) => set('shortDescription', e.target.value)} className="mt-1.5" data-testid="pf-short" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="desc">Full description</Label>
              <Textarea id="desc" rows={6} value={v.description} onChange={(e: any) => set('description', e.target.value)} className="mt-1.5" data-testid="pf-description" />
            </div>
          </div>
        </section>

        <section className={card}>
          <h2 className="mb-4 font-serif text-xl">Images</h2>
          <ImageManager value={v.images} onChange={(imgs) => set('images', imgs)} />
        </section>

        <section className={card}>
          <h2 className="mb-4 font-serif text-xl">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="mrp">MRP (₹) *</Label>
              <Input id="mrp" required inputMode="numeric" value={v.mrp} onChange={(e: any) => set('mrp', e.target.value.replace(/\D/g, ''))} className="mt-1.5" data-testid="pf-mrp" />
            </div>
            <div>
              <Label htmlFor="offer">Offer price (₹) *</Label>
              <Input id="offer" required inputMode="numeric" value={v.offerPrice} onChange={(e: any) => set('offerPrice', e.target.value.replace(/\D/g, ''))} className="mt-1.5" data-testid="pf-offer" />
            </div>
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground">
                {Number(v.offerPrice) > Number(v.mrp) ? <span className="text-red-700">Offer price is higher than MRP</span> : off > 0 ? <>Customers see <b className="text-maroon">{off}% off</b> · {formatINR(Number(v.offerPrice))}</> : 'No discount'}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className={card}>
          <h2 className="mb-4 font-serif text-xl">Status</h2>
          <div className="space-y-4">
            <div>
              <Label>Stock status</Label>
              <Select value={v.stockStatus} onValueChange={(s: StockStatusT) => set('stockStatus', s)}>
                <SelectTrigger className="mt-1.5" data-testid="pf-stock"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_STOCK">🟢 In Stock</SelectItem>
                  <SelectItem value="LIMITED_STOCK">🟠 Limited Stock</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">🔴 Out Of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {([
              ['isPublished', 'Published', 'Visible on the website'],
              ['isFeatured', 'Best Seller (featured)', 'Shown in Best Sellers on homepage'],
              ['isCustomizable', 'Customizable', 'Shows “Customize This Product” button'],
            ] as const).map(([k, label, hint]) => (
              <label key={k} className="flex cursor-pointer items-start justify-between gap-3 rounded-md border p-3">
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
                <Switch checked={v[k]} onCheckedChange={(c: boolean) => set(k, c)} data-testid={`pf-${k}`} />
              </label>
            ))}
          </div>
        </section>

        <section className={card}>
          <h2 className="mb-4 font-serif text-xl">Organise</h2>
          <Label>Category</Label>
          <Select value={v.categoryId ?? 'none'} onValueChange={(c: string) => set('categoryId', c === 'none' ? null : c)}>
            <SelectTrigger className="mt-1.5" data-testid="pf-category"><SelectValue placeholder="Choose category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Label className="mt-5 block">Tags</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {v.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-xs">
                {t}
                <button type="button" onClick={() => set('tags', v.tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <Input
            value={tagInput}
            onChange={(e: any) => setTagInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="Type a tag and press Enter"
            className="mt-2"
            data-testid="pf-tag-input"
          />
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestions.map((t) => (
                <button key={t} type="button" onClick={() => addTag(t)} className="rounded-full border px-2.5 py-1 text-xs hover:border-maroon">+ {t}</button>
              ))}
            </div>
          )}
        </section>

        <div className="sticky bottom-3 flex gap-2 rounded-md border bg-white p-3 shadow-sm">
          <button type="submit" disabled={saving} data-testid="pf-save" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-maroon text-sm font-medium text-ivory hover:bg-maroon-dark disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} {v.id ? 'Save changes' : 'Create product'}
          </button>
          {v.id && (
            <button type="button" onClick={remove} aria-label="Delete product" data-testid="pf-delete" className="inline-flex h-11 w-11 items-center justify-center rounded-md border text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
