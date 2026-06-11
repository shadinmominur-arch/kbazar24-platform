import { logWooError, wooClient } from './client';
import { transformCoupon } from './transformers';
import type { WooCoupon } from './types';

export async function getCouponsByCode(code: string): Promise<WooCoupon[]> {
  const normalizedCode = code.trim();
  if (!normalizedCode) return [];

  try {
    const response = await wooClient.get('/coupons', {
      params: { code: normalizedCode, per_page: 5 },
    });

    return Array.isArray(response.data)
      ? response.data.map(transformCoupon).filter((coupon) => coupon.id && coupon.code)
      : [];
  } catch (error) {
    logWooError('getCouponsByCode', error);
    return [];
  }
}
