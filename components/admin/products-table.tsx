'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2, Pencil, Search, Trash2, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from './upload';
import { formatINR, type StockStatusT } from '@/lib/format';

type Row = {
  id: string; name: string; slug: string; code: string; mrp: number; offerPrice: number;
  stockStatus: StockStatusT; isFeatured: boolean; isPublished: boolean;
  images: { imageUrl: string }[]; category: { name: string } | null;
};

export function ProductsTable() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Row[]; total: number; pageCount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api(`/api/admin/products?q=${encodeURIComponent(q)}&page=${page}`, 'GET'));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const patch = async (row: Row, body: Partial<Row>) => {
    setData((d) => d && { ...d, items: d.items.map((r) => (r.id === row.id ? { ...r, ...body } : r)) });
    try {
      await api(`/api/admin/products/${row.id}`, 'PATCH', body);
      toast.success('Updated — live on the website');
    } catch (e) {
      toast.error((e as Error).message);
      load();
    }
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete "${row.name}"? This also deletes its images.`)) return;
    try {
      await api(`/api/admin/products/${row.id}`, 'DELETE');
      toast.success('Product deleted');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="rounded-md border bg-white" data-testid="products-table">
      <div className="flex items-center gap-2 border-b p-3">
        <label className="flex h-10 flex-1 items-center gap-2 rounded-md border px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name or code" className="w-full bg-transparent text-sm outline-none" data-testid="admin-product-search" />
        </label>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {data && data.items.length === 0 && !loading && (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No products yet. <Link href="/admin/products/new" className="text-maroon underline">Create your first product</Link>
        </div>
      )}

      <ul className="divide-y">
        {data?.items.map((r) => (
          <li key={r.id} className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[1fr_auto] lg:items-center" data-testid="admin-product-row">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-cream">
                {r.images[0] && <Image src={r.images[0].imageUrl} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <Link href={`/admin/products/${r.id}`} className="block truncate font-medium hover:text-maroon">{r.name}</Link>
                <p className="truncate text-xs text-muted-foreground">
                  <span className="font-mono">{r.code}</span> · {r.category?.name ?? 'No category'} · {formatINR(r.offerPrice)}
                  {r.mrp > r.offerPrice && <span className="ml-1 line-through">{formatINR(r.mrp)}</span>}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Select value={r.stockStatus} onValueChange={(s: StockStatusT) => patch(r, { stockStatus: s })}>
                <SelectTrigger className="h-9 w-[150px]" data-testid="row-stock"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_STOCK">🟢 In Stock</SelectItem>
                  <SelectItem value="LIMITED_STOCK">🟠 Limited</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">🔴 Out Of Stock</SelectItem>
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-xs"><Switch checked={r.isFeatured} onCheckedChange={(c: boolean) => patch(r, { isFeatured: c })} data-testid="row-featured" /> Featured</label>
              <label className="flex items-center gap-2 text-xs"><Switch checked={r.isPublished} onCheckedChange={(c: boolean) => patch(r, { isPublished: c })} data-testid="row-published" /> Published</label>
              <div className="flex gap-1">
                <Link href={`/products/${r.slug}`} target="_blank" aria-label="View on site" className="rounded-md p-2 hover:bg-muted"><ExternalLink className="h-4 w-4" /></Link>
                <Link href={`/admin/products/${r.id}`} aria-label="Edit" className="rounded-md p-2 hover:bg-muted" data-testid="row-edit"><Pencil className="h-4 w-4" /></Link>
                <button onClick={() => remove(r)} aria-label="Delete" className="rounded-md p-2 text-red-700 hover:bg-red-50" data-testid="row-delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {data && data.pageCount > 1 && (
        <div className="flex items-center justify-between border-t p-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span className="text-muted-foreground">Page {page} of {data.pageCount}</span>
          <button disabled={page >= data.pageCount} onClick={() => setPage((p) => p + 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
