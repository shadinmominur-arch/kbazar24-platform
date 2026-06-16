import axios from 'axios';

export const PUBLIC_SITE_URL = 'https://kbazar24.com';
export const DEFAULT_INTERNAL_WOO_URL = process.env.NODE_ENV === 'production' ? 'http://127.0.0.1' : '';
export const WOO_URL = process.env.WOO_INTERNAL_URL || DEFAULT_INTERNAL_WOO_URL || process.env.NEXT_PUBLIC_WOO_URL || PUBLIC_SITE_URL;
export const LEGACY_IP_HOST = ['5', '189', '188', '229'].join('.');
export const LOCAL_WORDPRESS_HOSTS = new Set(['127.0.0.1', 'localhost']);
export const CONSUMER_KEY = process.env.WOO_CONSUMER_KEY || '';
export const CONSUMER_SECRET = process.env.WOO_CONSUMER_SECRET || '';
export const WOO_READ_TIMEOUT_MS = 8000;
export const IS_NEXT_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
const isHTTPS = WOO_URL.startsWith('https');

const wooApiConfig = isHTTPS
  ? { auth: { username: CONSUMER_KEY, password: CONSUMER_SECRET } }
  : {
      params: { consumer_key: CONSUMER_KEY, consumer_secret: CONSUMER_SECRET },
      headers: { Host: 'kbazar24.com', 'X-Forwarded-Proto': 'https' },
    };

export const wooClient = axios.create({
  baseURL: `${WOO_URL}/wp-json/wc/v3`,
  ...wooApiConfig,
  timeout: WOO_READ_TIMEOUT_MS,
});

export const wooWriteClient = axios.create({
  baseURL: `${WOO_URL}/wp-json/wc/v3`,
  ...wooApiConfig,
  timeout: 20000,
});

wooWriteClient.interceptors.response.use(undefined, async (error) => {
  const status  = error?.response?.status;
  const code    = error?.response?.data?.code   ?? '';
  const message = error?.response?.data?.message ?? '';
  const isKeyBroken =
    status === 401 &&
    (code === 'woocommerce_rest_cannot_create' ||
     code === 'woocommerce_rest_cannot_edit' ||
     message.includes('not allowed'));

  if (isKeyBroken && !IS_NEXT_BUILD && typeof window === 'undefined') {
    void fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `🚨 <b>WooCommerce write key rejected</b>\nNo automatic key rotation was attempted.\nRotate the BFF key intentionally, update .env.local, then restart emartweb.\n${new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}`,
        parse_mode: 'HTML',
      }),
    }).catch(() => {});
    console.error('[woo-write] WooCommerce write key rejected; operator rotation required', {
      status,
      code,
      message,
    });
  }

  throw error;
});

export const wordpressRestClient = axios.create({
  baseURL: `${WOO_URL}/wp-json/wp/v2`,
  headers: isHTTPS ? undefined : { Host: 'kbazar24.com', 'X-Forwarded-Proto': 'https' },
  timeout: WOO_READ_TIMEOUT_MS,
});

export function getSafeWooError(error: unknown): Record<string, unknown> {
  if (axios.isAxiosError(error)) {
    const responseMessage = typeof error.response?.data?.message === 'string'
      ? error.response.data.message
      : undefined;

    return {
      message: responseMessage || error.message,
      code: error.code,
      status: error.response?.status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Unknown error' };
}

export function logWooError(context: string, error: unknown, details?: Record<string, unknown>) {
  console.error(`${context} error:`, {
    ...getSafeWooError(error),
    ...details,
  });
}

export function getWooSafeMessage(context: string, error: unknown): string {
  const safe = getSafeWooError(error);
  return `${context} failed: ${String(safe.message || 'Unknown error')}`;
}

export function isWooNetworkError(error: unknown): boolean {
  const candidate = error as {
    cause?: { code?: string };
    message?: string;
    code?: string;
  };

  return (
    candidate?.cause?.code === 'ECONNRESET' ||
    candidate?.message?.includes('socket hang up') ||
    candidate?.code === 'ECONNREFUSED' ||
    candidate?.code === 'ETIMEDOUT' ||
    candidate?.code === 'ECONNABORTED'
  );
}

export function isBlockedFallbackStatus(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 401 || status === 403 || status === 404;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  context: string,
  retries = 2,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (isBlockedFallbackStatus(err) || attempt === retries) break;
      if (isWooNetworkError(err)) {
        const delay = attempt === 0 ? 500 : 1500;
        console.warn(`${context}: transient error, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        break;
      }
    }
  }
  throw lastError;
}
