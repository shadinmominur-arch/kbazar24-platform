'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { WooProduct } from '@/lib/woocommerce';

type FlashProduct = Pick<WooProduct, 'id' | 'slug' | 'name' | 'images' | 'price' | 'sale_price' | 'regular_price' | 'stock_quantity'>;

const FlashSaleBanner = dynamic(() => import('@/components/home/FlashSaleBanner'), { ssr: false });
const CustomerVoiceSection = dynamic(
  () => import('@/components/home/HomepageSections').then((m) => m.CustomerVoiceSection),
  { ssr: false },
);

function DeferredSection({ children, minHeight = 0 }: { children: ReactNode; minHeight?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || active) return undefined;

    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    const requestIdle = 'requestIdleCallback' in window
      ? window.requestIdleCallback.bind(window)
      : undefined;
    const cancelIdle = 'cancelIdleCallback' in window
      ? window.cancelIdleCallback.bind(window)
      : undefined;
    const activate = () => setActive(true);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            activate();
          }
        },
        { rootMargin: '900px 0px' },
      );
      observer.observe(node);

      if (requestIdle) {
        idleId = requestIdle(activate, { timeout: 3500 });
      } else {
        timerId = globalThis.setTimeout(activate, 3500);
      }

      return () => {
        observer.disconnect();
        if (idleId && cancelIdle) cancelIdle(idleId);
        if (timerId) globalThis.clearTimeout(timerId);
      };
    }

    timerId = globalThis.setTimeout(activate, 1200);
    return () => {
      if (timerId) globalThis.clearTimeout(timerId);
    };
  }, [active]);

  return (
    <div ref={ref} style={!active && minHeight ? { minHeight } : undefined}>
      {active ? children : null}
    </div>
  );
}

export default function HomepageDeferredSections({
  saleProducts,
}: {
  saleProducts: FlashProduct[];
}) {
  return (
    <>
      <DeferredSection minHeight={260}>
        <FlashSaleBanner products={saleProducts} />
      </DeferredSection>

      <DeferredSection minHeight={420}>
        <CustomerVoiceSection />
      </DeferredSection>
    </>
  );
}
