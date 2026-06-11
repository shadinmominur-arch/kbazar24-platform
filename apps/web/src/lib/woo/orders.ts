import { CONSUMER_KEY, CONSUMER_SECRET, PUBLIC_SITE_URL, logWooError, wooClient, wooWriteClient } from './client';
import type { WooBilling, WooMetaData, WooOrder, WooOrderNote, WooShipping } from './types';

export type WooOrderCreatePayload = {
  payment_method: string;
  payment_method_title?: string;
  billing: WooBilling;
  shipping: WooShipping;
  line_items: { product_id: number; variation_id?: number; quantity: number }[];
  shipping_lines?: { method_id: string; method_title: string; total: string }[];
  customer_id?: number;
  customer_note?: string;
  coupon_lines?: { code: string }[];
  meta_data?: { key: string; value: string }[];
};

export async function createOrderViaPlugin(payload: WooOrderCreatePayload): Promise<WooOrder> {
  const secret = process.env.EMART_ORDER_SECRET;
  if (!secret) {
    throw new Error('EMART_ORDER_SECRET not set');
  }

  const orderEndpointUrl = process.env.EMART_ORDER_ENDPOINT_URL || PUBLIC_SITE_URL;
  const orderStatus = payload.payment_method === 'cod' ? 'processing' : 'pending';
  const response = await fetch(`${orderEndpointUrl}/wp-json/emart/v1/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Host': 'e-mart.com.bd',
      'X-Emart-Secret': secret,
    },
    body: JSON.stringify({
      ...payload,
      currency: 'BDT',
      status: orderStatus,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Order creation failed: ${data?.error || data?.message || response.status}`) as Error & {
      response?: { status: number; data: unknown };
      status?: number;
    };
    error.status = response.status;
    error.response = { status: response.status, data };
    throw error;
  }

  return data as WooOrder;
}

export async function createOrder(orderData: WooOrderCreatePayload): Promise<WooOrder | null> {
  try {
    // Validate credentials are configured
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      console.error('WooCommerce credentials not configured');
      throw new Error('Payment system not configured. Contact support.');
    }

    const orderStatus = orderData.payment_method === 'cod' ? 'processing' : 'pending';

    const response = await wooWriteClient.post('/orders', {
      ...orderData,
      currency: 'BDT',
      status: orderStatus,
    });
    return response.data;
  } catch (error) {
    logWooError('createOrder', error);
    throw error; // Re-throw for better error handling at caller
  }
}

export async function getCustomerOrders(customerId: number): Promise<WooOrder[]> {
  try {
    const response = await wooClient.get('/orders', {
      params: { customer: customerId, per_page: 20 },
    });
    return response.data;
  } catch (error) {
    logWooError('getCustomerOrders', error, { customerId });
    return [];
  }
}

export async function getRecentOrders(limit = 10): Promise<WooOrder[]> {
  try {
    const response = await wooClient.get('/orders', {
      params: {
        per_page: limit,
        orderby: 'date',
        order: 'desc',
        status: 'processing,completed',
      },
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    logWooError('getRecentOrders', error, { limit });
    return [];
  }
}

export async function getOrder(orderId: number): Promise<WooOrder | null> {
  try {
    const response = await wooClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    logWooError('getOrder', error, { orderId });
    return null;
  }
}

export async function getOrders(params: {
  status?: string;
  per_page?: number;
  page?: number;
}): Promise<WooOrder[]> {
  try {
    const response = await wooClient.get('/orders', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    logWooError('getOrders', error, params);
    return [];
  }
}

export async function getOrderNotes(orderId: number): Promise<WooOrderNote[]> {
  try {
    const response = await wooClient.get(`/orders/${orderId}/notes`, {
      params: { per_page: 50 },
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    logWooError('getOrderNotes', error, { orderId });
    return [];
  }
}

export async function updateOrder(
  orderId: number,
  data: { status?: string; meta_data?: { key: string; value: string }[] },
): Promise<WooOrder | null> {
  try {
    const response = await wooClient.put(`/orders/${orderId}`, data);
    return response.data;
  } catch (error) {
    logWooError('updateOrder', error, { orderId });
    return null;
  }
}

export async function addOrderNote(orderId: number, note: string, customerNote = false): Promise<void> {
  try {
    await wooClient.post(`/orders/${orderId}/notes`, { note, customer_note: customerNote });
  } catch (error) {
    logWooError('addOrderNote', error, { orderId });
  }
}
