import { headers } from 'next/headers';

/** Public base URL of the site. Uses env (SITE_URL / Netlify URL / NEXT_PUBLIC_BASE_URL) or request host. */
export async function getBaseUrl(): Promise<string> {
  const env = process.env.SITE_URL || process.env.URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, '');
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'https';
    if (host) return `${proto}://${host}`;
  } catch {
    /* not in a request scope */
  }
  return '';
}

export const BRAND = {
  name: 'Kalakriti Studios',
  tagline: 'Handmade art & thoughtful gifts',
  description:
    'Kalakriti Studios creates handmade festive décor, soulful hand sketches and heirloom rakhis — thoughtfully crafted art and gifts, made by hand in India.',
};
