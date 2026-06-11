import { logWooError, wooClient, wooWriteClient } from './client';
import type { WooCustomer } from './types';

export async function getCustomer(id: number): Promise<WooCustomer | null> {
  try {
    const response = await wooClient.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function getCustomerByEmail(email: string): Promise<WooCustomer | null> {
  try {
    const response = await wooClient.get('/customers', {
      params: { email, per_page: 1 },
    });
    const [customer] = Array.isArray(response.data) ? response.data : [];
    return customer ?? null;
  } catch (error) {
    return null;
  }
}

export async function createCustomer(data: {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}, options?: { quietExistingEmail?: boolean }): Promise<WooCustomer | null> {
  try {
    const response = await wooWriteClient.post('/customers', data);
    return response.data;
  } catch (error) {
    const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
    const message = String((error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '');
    const isExistingEmail = status === 400 && message.toLowerCase().includes('already registered');
    if (!options?.quietExistingEmail || !isExistingEmail) {
      logWooError('createCustomer', error);
    }
    return null;
  }
}

export async function updateCustomer(id: number, data: Record<string, unknown>): Promise<WooCustomer | null> {
  try {
    const response = await wooWriteClient.put(`/customers/${id}`, data);
    return response.data;
  } catch (error) {
    logWooError('updateCustomer', error, { customerId: id });
    return null;
  }
}
