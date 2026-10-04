'use client';

import { useState } from 'react';
import { Share2, Link2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function absolute(path: string) {
  return path.startsWith('http') ? path : `${window.location.origin}${path}`;
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

/** Compact share for product cards: native share sheet where supported, otherwise copies link. */
export function ShareIconButton({ path, title, className }: { path: string; title: string; className?: string }) {
  const onClick = async () => {
    const url = absolute(path);
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} — Kalakriti Studios`, url });
        return;
      } catch {
        return;
      }
    }
    await copy(url);
    toast.success('Product link copied');
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Share ${title}`}
      data-testid="card-share-btn"
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-white text-charcoal transition-colors hover:border-maroon hover:text-maroon',
        className
      )}
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}

/** Full share row for product page. */
export function ShareButtons({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => absolute(path);
  const canNative = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="share-buttons">
      <span className="mr-1 text-xs uppercase tracking-eyebrow text-muted-foreground">Share</span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — Kalakriti Studios\n${url()}`)}`, '_blank', 'noopener');
        }}
        data-testid="share-whatsapp"
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm hover:border-maroon hover:text-maroon"
      >
        WhatsApp
      </a>
      <button
        type="button"
        data-testid="share-copy"
        onClick={async () => {
          await copy(url());
          setCopied(true);
          toast.success('Product link copied');
          setTimeout(() => setCopied(false), 2000);
        }}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm hover:border-maroon hover:text-maroon"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} {copied ? 'Copied' : 'Copy link'}
      </button>
      {canNative && (
        <button
          type="button"
          data-testid="share-native"
          onClick={() => navigator.share({ title, url: url() }).catch(() => {})}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm hover:border-maroon hover:text-maroon"
        >
          <Share2 className="h-4 w-4" /> More
        </button>
      )}
    </div>
  );
}
