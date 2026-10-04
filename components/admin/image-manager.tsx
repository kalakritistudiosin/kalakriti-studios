'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { getSignature, uploadFile, validateFile, ACCEPT, type UploadedImage, type UploadKind } from './upload';

type Pending = { id: string; name: string; pct: number };

export function ImageManager({ value, onChange, max = 15 }: { value: UploadedImage[]; onChange: (v: UploadedImage[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const latest = useRef(value);
  latest.current = value;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, Math.max(max - value.length, 0));
    if (list.length < files.length) toast.warning(`Maximum ${max} images per product`);
    const valid = list.filter((f) => {
      const err = validateFile(f);
      if (err) toast.error(err);
      return !err;
    });
    if (!valid.length) return;
    let sig;
    try {
      sig = await getSignature('product');
    } catch (e) {
      toast.error((e as Error).message);
      return;
    }
    const items = valid.map((f) => ({ id: Math.random().toString(36).slice(2), name: f.name, pct: 0 }));
    setPending((p) => [...p, ...items]);
    await Promise.all(
      valid.map(async (f, i) => {
        try {
          const img = await uploadFile(f, sig, (pct) => setPending((p) => p.map((x) => (x.id === items[i].id ? { ...x, pct } : x))));
          onChange([...latest.current, img]);
          latest.current = [...latest.current, img];
        } catch (e) {
          toast.error(`${f.name}: ${(e as Error).message}`);
        } finally {
          setPending((p) => p.filter((x) => x.id !== items[i].id));
        }
      })
    );
    if (input.current) input.current.value = '';
  };

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const makePrimary = (i: number) => onChange([value[i], ...value.filter((_, k) => k !== i)]);
  const remove = (i: number) => onChange(value.filter((_, k) => k !== i));

  return (
    <div data-testid="image-manager">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((im, i) => (
          <div key={im.publicId} className="group relative overflow-hidden rounded-md border bg-white" data-testid={`image-item-${i}`}>
            <div className="relative aspect-square bg-cream">
              <Image src={im.url} alt="" fill sizes="200px" className="object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-sm bg-maroon px-1.5 py-0.5 text-[10px] font-medium text-ivory">Primary</span>}
            </div>
            <div className="flex items-center justify-between gap-1 p-1.5">
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move left" className="rounded p-1.5 hover:bg-muted disabled:opacity-30"><ArrowLeft className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move right" className="rounded p-1.5 hover:bg-muted disabled:opacity-30"><ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
              <div className="flex gap-1">
                {i !== 0 && (
                  <button type="button" onClick={() => makePrimary(i)} aria-label="Set as primary" title="Set as primary" data-testid={`image-primary-${i}`} className="rounded p-1.5 text-gold-dark hover:bg-muted"><Star className="h-3.5 w-3.5" /></button>
                )}
                <button type="button" onClick={() => remove(i)} aria-label="Delete image" data-testid={`image-delete-${i}`} className="rounded p-1.5 text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {pending.map((p) => (
          <div key={p.id} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-white p-3 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-maroon" />
            <span className="line-clamp-1 text-[11px] text-muted-foreground">{p.name}</span>
            <div className="h-1 w-full overflow-hidden rounded bg-muted"><div className="h-full bg-maroon transition-all" style={{ width: `${p.pct}%` }} /></div>
          </div>
        ))}
        {value.length + pending.length < max && (
          <button type="button" onClick={() => input.current?.click()} data-testid="image-upload-btn" className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gold/60 bg-cream/40 text-sm text-charcoal-light hover:border-maroon hover:text-maroon">
            <ImagePlus className="h-6 w-6" />
            Add images
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={ACCEPT.join(',')} multiple hidden onChange={(e) => onFiles(e.target.files)} data-testid="image-file-input" />
      <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, WEBP or AVIF up to 8 MB. The first image is the primary image. Removed images are deleted from Cloudinary when you save.</p>
    </div>
  );
}

export function SingleImageField({ value, onChange, kind, testId }: { value: string; onChange: (img: UploadedImage | null) => void; kind: UploadKind; testId?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState<number | null>(null);
  const onFile = async (f?: File) => {
    if (!f) return;
    const err = validateFile(f);
    if (err) return toast.error(err);
    try {
      setPct(0);
      const sig = await getSignature(kind);
      onChange(await uploadFile(f, sig, setPct));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setPct(null);
      if (input.current) input.current.value = '';
    }
  };
  return (
    <div className="flex items-center gap-4" data-testid={testId}>
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-cream">
        {value ? <Image src={value} alt="" fill sizes="96px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>}
        {pct !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-xs font-medium text-maroon">{pct}%</div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={pct !== null} className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm hover:border-maroon">
          <ImagePlus className="h-4 w-4" /> {value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={ACCEPT.join(',')} hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}
