import { Suspense } from 'react';
import type { Metadata } from 'next';
import TrackOrderClient from './TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Track your Emart order status. Enter your order number to see delivery updates, courier tracking, and estimated delivery time.',
  alternates: { canonical: 'https://e-mart.com.bd/track-order' },
  robots: { index: false, follow: false },
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
