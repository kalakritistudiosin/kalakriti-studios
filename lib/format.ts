export type StockStatusT = 'IN_STOCK' | 'LIMITED_STOCK' | 'OUT_OF_STOCK';

export const STOCK: Record<StockStatusT, { label: string; dot: string; text: string; bg: string }> = {
  IN_STOCK: { label: 'In Stock', dot: 'bg-emerald-600', text: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  LIMITED_STOCK: { label: 'Limited Stock', dot: 'bg-orange-500', text: 'text-orange-800', bg: 'bg-orange-50 border-orange-200' },
  OUT_OF_STOCK: { label: 'Out Of Stock', dot: 'bg-red-600', text: 'text-red-800', bg: 'bg-red-50 border-red-200' },
};

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatINR = (n: number) => inr.format(n || 0);

export const discountPercent = (mrp: number, offer: number) =>
  mrp > 0 && offer < mrp ? Math.round(((mrp - offer) / mrp) * 100) : 0;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export const waDigits = (n?: string | null) => (n || '').replace(/\D/g, '');

export function whatsappOrderLink(number: string | null | undefined, p: { name: string; code: string; offerPrice: number }) {
  const digits = waDigits(number);
  if (!digits) return null;
  const msg = `Hello Kalakriti Studios,\n\nI would like to order:\n\nProduct: ${p.name}\nProduct Code: ${p.code}\nPrice: ${formatINR(p.offerPrice)}\n\nPlease share further details.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export function whatsappCustomizeLink(number: string | null | undefined, p: { name: string; code: string }) {
  const digits = waDigits(number);
  if (!digits) return null;
  const msg = `Hello Kalakriti Studios,\n\nI would like to customize this product:\n\nProduct: ${p.name}\nProduct Code: ${p.code}\n\nMy customization request:\n`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export function whatsappChatLink(number: string | null | undefined, text = 'Hello Kalakriti Studios, I would like to know more about your handmade collection.') {
  const digits = waDigits(number);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function instagramHandle(url?: string | null) {
  if (!url) return '';
  const m = url.match(/instagram\.com\/([^/?#]+)/i);
  return m ? `@${m[1]}` : url;
}

/** Cloudinary transformation helper (for plain <img> / OG images). */
export function cld(url: string | null | undefined, t = 'f_auto,q_auto,c_limit,w_1200') {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) return url.replace('/upload/', `/upload/${t}/`);
  return url;
}
