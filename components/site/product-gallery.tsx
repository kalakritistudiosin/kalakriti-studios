'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';

type Img = { url: string };

/** Lightweight swipe detection (no animation library). */
function useSwipe(onLeft: () => void, onRight: () => void, enabled = true) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      if (!enabled) return;
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!enabled || !start.current) return;
      const dx = e.changedTouches[0].clientX - start.current.x;
      const dy = e.changedTouches[0].clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onLeft : onRight)();
    },
  };
}

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);
  const swipe = useSwipe(() => go(1), () => go(-1), count > 1);

  if (!count) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-md bg-cream font-serif text-6xl text-gold/50" data-testid="gallery-empty">
        K
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row" data-testid="product-gallery">
      {count > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto md:max-h-[640px] md:w-20 md:flex-col md:overflow-y-auto">
          {images.map((im, i) => (
            <button
              key={im.url + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              data-testid={`gallery-thumb-${i}`}
              className={cn(
                'relative aspect-square w-16 shrink-0 overflow-hidden rounded-sm border-2 bg-cream transition md:w-full',
                i === index ? 'border-maroon' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image src={im.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden rounded-md bg-cream">
        <div
          key={index}
          className="relative aspect-[4/5] cursor-zoom-in touch-pan-y animate-in fade-in duration-300"
          {...swipe}
          onClick={() => setOpen(true)}
          data-testid="gallery-main"
        >
          <Image
            src={images[index].url}
            alt={`${name} — image ${index + 1}`}
            fill
            priority
            draggable={false}
            sizes="(min-width:1024px) 50vw, 100vw"
            className="pointer-events-none select-none object-cover"
          />
        </div>

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" data-testid="gallery-prev" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-charcoal hover:bg-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" data-testid="gallery-next" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-charcoal hover:bg-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <span className="absolute bottom-3 left-3 rounded-sm bg-charcoal/70 px-2 py-0.5 text-xs text-ivory" data-testid="gallery-counter">
          {index + 1} / {count}
        </span>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open full screen" data-testid="gallery-fullscreen" className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-charcoal hover:bg-white">
          <Expand className="h-4 w-4" />
        </button>
      </div>

      {open && <Lightbox images={images} index={index} setIndex={setIndex} go={go} name={name} onClose={() => setOpen(false)} />}
    </div>
  );
}

function Lightbox({
  images,
  index,
  setIndex,
  go,
  name,
  onClose,
}: {
  images: Img[];
  index: number;
  setIndex: (i: number) => void;
  go: (d: number) => void;
  name: string;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const ref = useRef<HTMLDivElement>(null);
  const count = images.length;
  const swipe = useSwipe(() => go(1), () => go(-1), !zoom && count > 1);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [go, onClose]);

  useEffect(() => setZoom(false), [index]);

  const setOriginFromEvent = (clientX: number, clientY: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setOrigin(`${((clientX - r.left) / r.width) * 100}% ${((clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#1c1a18]/[0.97] text-ivory animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} image viewer`}
      data-testid="lightbox"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm tracking-wide" data-testid="lightbox-counter">
          {index + 1} / {count}
        </span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setZoom((z) => !z)} aria-label={zoom ? 'Zoom out' : 'Zoom in'} data-testid="lightbox-zoom" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
            {zoom ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>
          <button type="button" onClick={onClose} aria-label="Close" data-testid="lightbox-close" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden" ref={ref}>
        <div
          key={index}
          className={cn('absolute inset-0 animate-in fade-in duration-200', zoom ? 'cursor-zoom-out' : 'cursor-zoom-in')}
          {...swipe}
          onClick={(e) => {
            setOriginFromEvent(e.clientX, e.clientY);
            setZoom((z) => !z);
          }}
          onMouseMove={(e) => zoom && setOriginFromEvent(e.clientX, e.clientY)}
          onTouchMove={(e) => zoom && setOriginFromEvent(e.touches[0].clientX, e.touches[0].clientY)}
        >
          <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: zoom ? 'scale(2.2)' : 'scale(1)', transformOrigin: origin }}>
            <Image src={images[index].url} alt={`${name} — image ${index + 1}`} fill sizes="100vw" quality={90} draggable={false} className="pointer-events-none select-none object-contain" />
          </div>
        </div>
        {count > 1 && !zoom && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" data-testid="lightbox-prev" className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:left-6">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" data-testid="lightbox-next" className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:right-6">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="no-scrollbar flex justify-center gap-2 overflow-x-auto px-4 py-3">
          {images.map((im, i) => (
            <button key={im.url + i} type="button" onClick={() => setIndex(i)} aria-label={`Image ${i + 1}`} className={cn('relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border-2', i === index ? 'border-gold' : 'border-transparent opacity-60')}>
              <Image src={im.url} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
