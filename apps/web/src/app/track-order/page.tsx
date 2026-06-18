import { Suspense } from 'react';
import type { Metadata } from 'next';
import { COMPANY } from '@/lib/companyProfile';
import { absoluteUrl } from '@/lib/siteUrl';
import TrackOrderClient from './TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Track your Kbazar order status. Enter your order number to see delivery updates, courier tracking, and estimated delivery time.',
  alternates: { canonical: 'https://kbazar24.com/track-order' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Track Your Order | Kbazar',
    description: 'Track your Kbazar order status. Enter your order number to see delivery updates, courier tracking, and estimated delivery time.',
    url: 'https://kbazar24.com/track-order',
    siteName: COMPANY.storeName,
    locale: 'en_BD',
    images: [{ url: absoluteUrl('/kbazar-logo.png'), width: 600, height: 600, alt: 'Kbazar Korean Cosmetics Store' }],
  },
};

function TrackOrderFallback() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-xl border border-hairline bg-white p-6 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-bg-alt" />
        <div className="mt-4 h-12 animate-pulse rounded-lg bg-bg-alt" />
        <p className="mt-4 text-sm text-muted">
          Preparing the order tracking form. You can enter your order number and phone once it loads.
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <h1 className="sr-only">Track Your Order</h1>
      <Suspense fallback={<TrackOrderFallback />}>
        <TrackOrderClient />
      </Suspense>
    </>
  );
}
