import { cn } from '@/lib/utils';
import { formatINR, discountPercent } from '@/lib/format';

export function Price({ mrp, offer, size = 'md', className }: { mrp: number; offer: number; size?: 'md' | 'lg'; className?: string }) {
  const off = discountPercent(mrp, offer);
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)} data-testid="price">
      <span className={cn('font-semibold text-charcoal', size === 'lg' ? 'text-3xl font-serif' : 'text-lg')}>{formatINR(offer)}</span>
      {off > 0 && (
        <>
          <span className={cn('text-muted-foreground line-through', size === 'lg' ? 'text-base' : 'text-sm')}>{formatINR(mrp)}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-maroon">{off}% off</span>
        </>
      )}
    </div>
  );
}
