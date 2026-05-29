import { Suspense } from 'react';
import type { Metadata } from 'next';
import OrderSuccessClient from './OrderSuccessClient';

export const metadata: Metadata = {
  title: 'Order Success',
  robots: { index: false, follow: false },
};

function OrderSuccessFallback() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-xl border border-hairline bg-white p-6 shadow-sm">
        <div className="h-5 w-48 animate-pulse rounded bg-bg-alt" />
        <div className="mt-4 h-16 animate-pulse rounded-lg bg-bg-alt" />
        <p className="mt-4 text-sm text-muted">
          Preparing your order confirmation details.
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<OrderSuccessFallback />}>
      <OrderSuccessClient />
    </Suspense>
  );
}
