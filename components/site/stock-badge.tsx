import { cn } from '@/lib/utils';
import { STOCK, type StockStatusT } from '@/lib/format';

export function StockBadge({ status, className }: { status: StockStatusT; className?: string }) {
  const s = STOCK[status] ?? STOCK.IN_STOCK;
  return (
    <span
      data-testid="stock-badge"
      className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium', s.bg, s.text, className)}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}
