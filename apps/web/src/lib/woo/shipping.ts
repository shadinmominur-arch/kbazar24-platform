import { STORE_POLICIES } from '@/config/storePolicies';
import { logWooError, wooClient } from './client';
import { getProductById } from './products';
import type { WooRawShippingMethod, WooRawShippingZone, WooShippingQuote } from './types';

export async function calculateLineItemsSubtotal(lineItems: { product_id: number; variation_id?: number; quantity: number }[],
): Promise<number> {
  let subtotal = 0;

  for (const item of lineItems) {
    const productId = Number(item?.variation_id || item?.product_id || 0);
    const quantity = Math.max(1, Math.floor(Number(item?.quantity || 1)));
    if (!productId) continue;

    const product = await getProductById(productId);
    const price = Number(product?.sale_price || product?.price || product?.regular_price || 0);
    if (Number.isFinite(price) && price > 0) {
      subtotal += price * quantity;
    }
  }

  return Math.round(subtotal);
}

function methodSettingValue(method: WooRawShippingMethod, key: string): string {
  const setting = method?.settings?.[key];
  if (setting && typeof setting === 'object' && 'value' in setting) {
    return String(setting.value || '');
  }
  return '';
}

function methodCost(method: WooRawShippingMethod): number {
  const value = methodSettingValue(method, 'cost') || String(method?.cost || '');
  const numeric = Number(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function methodMinAmount(method: WooRawShippingMethod): number | null {
  const value = methodSettingValue(method, 'min_amount') || String(method?.min_amount || '');
  const numeric = Number(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function isShippingMethodEnabled(method: WooRawShippingMethod): boolean {
  return method?.enabled === true || method?.enabled === 'yes' || method?.enabled === '1';
}

function shippingMethodId(method: WooRawShippingMethod): string {
  return String(method?.method_id || method?.id || '');
}

export async function getShippingQuote(city: string, subtotal: number): Promise<WooShippingQuote> {
  const normalizedCity = String(city || '').trim().toLowerCase();
  const wantsDhaka = normalizedCity === 'dhaka' || normalizedCity.includes('dhaka');
  const fallback = wantsDhaka
    ? { zoneName: 'Dhaka City', methodId: 'flat_rate', methodTitle: 'Delivery inside Dhaka', total: STORE_POLICIES.shipping.dhakaShippingFee }
    : { zoneName: 'All Bangladesh', methodId: 'flat_rate', methodTitle: 'Delivery outside Dhaka', total: STORE_POLICIES.shipping.outsideDhakaShippingFee };

  try {
    const zonesResponse = await wooClient.get('/shipping/zones');
    const zones: WooRawShippingZone[] = Array.isArray(zonesResponse.data) ? zonesResponse.data : [];
    const zone = zones.find((item) => {
      const name = String(item?.name || '').toLowerCase();
      return wantsDhaka ? name.includes('dhaka') : name.includes('bangladesh');
    });

    if (!zone?.id) {
      return { city, ...fallback, isFree: false, freeShippingEnabled: false, freeShippingThreshold: null };
    }

    const methodsResponse = await wooClient.get(`/shipping/zones/${zone.id}/methods`);
    const methods: WooRawShippingMethod[] = Array.isArray(methodsResponse.data) ? methodsResponse.data : [];
    const flatRate = methods.find((method) => shippingMethodId(method) === 'flat_rate' && isShippingMethodEnabled(method));
    const freeShipping = methods.find((method) => shippingMethodId(method) === 'free_shipping' && isShippingMethodEnabled(method));
    const threshold = freeShipping ? methodMinAmount(freeShipping) : null;
    const freeApplies = Boolean(freeShipping && (!threshold || subtotal >= threshold));

    if (freeShipping && freeApplies) {
      return {
        city,
        zoneName: String(zone.name || fallback.zoneName),
        methodId: 'free_shipping',
        methodTitle: String(freeShipping.title || 'Free Delivery'),
        total: 0,
        isFree: true,
        freeShippingEnabled: true,
        freeShippingThreshold: threshold,
      };
    }

    const cost = flatRate ? methodCost(flatRate) : fallback.total;
    return {
      city,
      zoneName: String(zone.name || fallback.zoneName),
      methodId: flatRate ? 'flat_rate' : fallback.methodId,
      methodTitle: String(flatRate?.title || fallback.methodTitle),
      total: Math.round(cost),
      isFree: false,
      freeShippingEnabled: Boolean(freeShipping),
      freeShippingThreshold: threshold,
    };
  } catch (error) {
    logWooError('getShippingQuote', error, { city, subtotal });
    return { city, ...fallback, isFree: false, freeShippingEnabled: false, freeShippingThreshold: null };
  }
}
