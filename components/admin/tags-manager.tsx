'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from './upload';

type Tag = { id: string; name: string; slug: string; _count: { products: number } };

export function TagsManager({ initial }: { initial: Tag[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [edit, setEdit] = useState<{ id: string; name: string } | null>(null);

  const run = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="rounded-md border bg-white" data-testid="tags-manager">
      <form
        className="flex gap-2 border-b p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          run(() => api('/api/admin/tags', 'POST', { name }), 'Tag added').then(() => setName(''));
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name" className="h-10 flex-1 rounded-md border px-3 text-sm outline-none focus:border-maroon" data-testid="tag-name-input" />
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-maroon px-4 text-sm text-ivory" data-testid="tag-add-btn"><Plus className="h-4 w-4" /> Add</button>
      </form>
      {initial.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No tags yet. Tags are also created automatically when you add them to a product.</p>}
      <ul className="divide-y">
        {initial.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-2 px-4 py-3" data-testid="tag-row">
            {edit?.id === t.id ? (
              <input autoFocus value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="h-9 flex-1 rounded-md border px-3 text-sm" />
            ) : (
              <span className="text-sm">#{t.name} <span className="text-xs text-muted-foreground">· {t._count.products} products</span></span>
            )}
            <div className="flex gap-1">
              {edit?.id === t.id ? (
                <>
                  <button onClick={() => run(() => api(`/api/admin/tags/${t.id}`, 'PUT', { name: edit.name }), 'Tag renamed').then(() => setEdit(null))} aria-label="Save" className="rounded-md p-2 hover:bg-muted"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEdit(null)} aria-label="Cancel" className="rounded-md p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
                </>
              ) : (
                <button onClick={() => setEdit({ id: t.id, name: t.name })} aria-label="Rename" className="rounded-md p-2 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
              )}
              <button onClick={() => confirm(`Delete tag "${t.name}"?`) && run(() => api(`/api/admin/tags/${t.id}`, 'DELETE'), 'Tag deleted')} aria-label="Delete" className="rounded-md p-2 text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
