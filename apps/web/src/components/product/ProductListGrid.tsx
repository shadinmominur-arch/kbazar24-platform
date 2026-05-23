import type { ReactNode } from 'react';

export function ProductListGrid({ children }: { children: ReactNode }) {
  return (
    <div className="product-listing grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
