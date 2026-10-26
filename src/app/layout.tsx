import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { FomoPopup } from '@/components/site/fomo-popup';
import { serverGetSafe } from '@/lib/api';
import type { MenuData, PublicSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Tours & Travel | Tours, Tickets and Unforgettable Experiences',
    template: '%s | Tours & Travel',
  },
  description:
    'Book hand-picked tours, attraction tickets and unique travel experiences worldwide. Instant confirmation, secure payments and free cancellation on selected tours.',
  icons: { icon: '/favicon.svg' },
};

const FALLBACK_SETTINGS: PublicSettings = {
  siteName: 'Tours & Travel',
  currency: 'EUR',
  currencySymbol: '€',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, menu] = await Promise.all([
    serverGetSafe<PublicSettings>('/settings/public', FALLBACK_SETTINGS, 0),
    serverGetSafe<MenuData | null>('/menu', null, 300),
  ]);
  const siteName = settings.siteName || 'Tours & Travel';

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <Header siteName={siteName} menu={menu ?? undefined} />
          <main className="min-h-[60vh]">{children}</main>
          <Footer siteName={siteName} socials={settings.socials ?? []} />
          <FomoPopup entries={settings.fomo?.entries ?? []} />
        </Providers>
      </body>
    </html>
  );
}
