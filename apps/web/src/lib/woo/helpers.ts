import { isProductAvailable } from '@/lib/stock';
import type { WooProduct } from './types';

export function getDiscountPercent(regular: string, sale: string): number {
  const reg = parseFloat(regular);
  const sal = parseFloat(sale);
  if (!reg || !sal) return 0;
  return Math.round(((reg - sal) / reg) * 100);
}

export function isInStock(product: WooProduct): boolean {
  return isProductAvailable(product);
}
