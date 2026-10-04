'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';

type Img = { url: string };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

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
        <motion.div
          key={index}
          className="relative aspect-[4/5] cursor-zoom-in touch-pan-y"
          drag={count > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(1);
            else if (info.offset.x > 60) go(-1);
          }}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
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
        </motion.div>

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

      <AnimatePresence>{open && <Lightbox images={images} index={index} setIndex={setIndex} go={go} name={name} onClose={() => setOpen(false)} />}</AnimatePresence>
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
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-[#1c1a18]/[0.97] text-ivory"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        <motion.div
          key={index}
          className={cn('absolute inset-0', zoom ? 'cursor-zoom-out' : 'cursor-zoom-in')}
          drag={!zoom && count > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(1);
            else if (info.offset.x > 60) go(-1);
          }}
          onClick={(e) => {
            setOriginFromEvent(e.clientX, e.clientY);
            setZoom((z) => !z);
          }}
          onMouseMove={(e) => zoom && setOriginFromEvent(e.clientX, e.clientY)}
          onTouchMove={(e) => zoom && setOriginFromEvent(e.touches[0].clientX, e.touches[0].clientY)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 transition-transform duration-300 ease-out" style={{ transform: zoom ? 'scale(2.2)' : 'scale(1)', transformOrigin: origin }}>
            <Image src={images[index].url} alt={`${name} — image ${index + 1}`} fill sizes="100vw" quality={90} draggable={false} className="pointer-events-none select-none object-contain" />
          </div>
        </motion.div>
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
    </motion.div>
  );
}
