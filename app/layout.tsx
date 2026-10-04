import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { getBaseUrl, BRAND } from '@/lib/site';
import './globals.css';

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-serif', display: 'swap' });
const sans = Jost({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const base = await getBaseUrl();
  return {
    ...(base ? { metadataBase: new URL(base) } : {}),
    title: { default: `${BRAND.name} — ${BRAND.tagline}`, template: `%s | ${BRAND.name}` },
    description: BRAND.description,
    applicationName: BRAND.name,
    alternates: { canonical: '/' },
    openGraph: { type: 'website', siteName: BRAND.name, locale: 'en_IN', title: BRAND.name, description: BRAND.description },
    twitter: { card: 'summary_large_image', title: BRAND.name, description: BRAND.description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: '#6B1E2A', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
