/**
 * Pathao Courier API client.
 *
 * Token lifecycle:
 *   1. First call fetches a password-grant token and writes it to TOKEN_FILE.
 *   2. Subsequent calls read from TOKEN_FILE; if the token has < 60 s remaining
 *      it is refreshed transparently using the stored refresh_token.
 *   3. TOKEN_FILE lives outside apps/web so it survives .next clean-builds.
 */

import fs from 'fs';
import path from 'path';

// ── Config ─────────────────────────────────────────────────────────────────

const BASE_URL = (process.env.PATHAO_BASE_URL || 'https://courier-api-sandbox.pathao.com').replace(/\/$/, '');
const CLIENT_ID = process.env.PATHAO_CLIENT_ID || '';
const CLIENT_SECRET = process.env.PATHAO_CLIENT_SECRET || '';
const USERNAME = process.env.PATHAO_USERNAME || '';
const PASSWORD = process.env.PATHAO_PASSWORD || '';

// Two levels up from apps/web → project root (works on both local & VPS)
const TOKEN_FILE = path.join(process.cwd(), '../../.pathao-token.json');

// ── Types ──────────────────────────────────────────────────────────────────

export interface PathaoToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: number; // Unix ms timestamp
}

export interface PathaoOrderPayload {
  store_id: number;
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: number;
  recipient_zone: number;
  recipient_area?: number;
  delivery_type: number;   // 48 = regular, 12 = express
  item_type: number;       // 2 = parcel
  special_instruction?: string;
  item_quantity: number;
  item_weight: number;     // kg
  item_description?: string;
  amount_to_collect: number; // 0 for prepaid, order total for COD
}

export interface PathaoOrderResponse {
  consignment_id: string;
  merchant_order_id: string;
  order_status: string;
  delivery_fee: number;
}

// ── Token persistence ──────────────────────────────────────────────────────

function readStoredToken(): PathaoToken | null {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
    return JSON.parse(raw) as PathaoToken;
  } catch {
    return null;
  }
}

function writeToken(token: PathaoToken): void {
  try {
    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2), { mode: 0o600 });
  } catch (err) {
    console.error('[Pathao] Failed to write token file:', err);
  }
}

function isTokenValid(token: PathaoToken): boolean {
  // Consider valid if at least 60 seconds remain
  return token.expires_at - Date.now() > 60_000;
}

// ── HTTP helpers ───────────────────────────────────────────────────────────

async function pathaoPost<T>(endpoint: string, body: Record<string, unknown>, accessToken?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (json as any)?.message || (json as any)?.error || `HTTP ${res.status}`;
    throw new Error(`Pathao API error (${endpoint}): ${msg}`);
  }

  return json as T;
}

async function pathaoGet<T>(endpoint: string, accessToken: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (json as any)?.message || (json as any)?.error || `HTTP ${res.status}`;
    throw new Error(`Pathao API error (${endpoint}): ${msg}`);
  }

  return json as T;
}

// ── Token management (public) ──────────────────────────────────────────────

/** Fetches a fresh token using password grant and stores it. */
export async function fetchNewToken(): Promise<PathaoToken> {
  if (!CLIENT_ID || !CLIENT_SECRET || !USERNAME || !PASSWORD) {
    throw new Error('Pathao credentials are not configured (check PATHAO_* env vars)');
  }

  const data = await pathaoPost<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }>('/aladdin/api/v1/issue-token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    username: USERNAME,
    password: PASSWORD,
    grant_type: 'password',
  });

  const token: PathaoToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  writeToken(token);
  return token;
}

/** Refreshes using stored refresh_token and persists the new token. */
async function refreshToken(stored: PathaoToken): Promise<PathaoToken> {
  const data = await pathaoPost<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }>('/aladdin/api/v1/issue-token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: stored.refresh_token,
    grant_type: 'refresh_token',
  });

  const token: PathaoToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  writeToken(token);
  return token;
}

/**
 * Returns a valid access_token string, refreshing or re-authenticating
 * transparently when needed.
 */
export async function getAccessToken(): Promise<string> {
  let token = readStoredToken();

  if (!token) {
    token = await fetchNewToken();
  } else if (!isTokenValid(token)) {
    try {
      token = await refreshToken(token);
    } catch {
      // Refresh token may be expired — fall back to full re-auth
      token = await fetchNewToken();
    }
  }

  return token.access_token;
}

// ── Order creation (public) ────────────────────────────────────────────────

/** Creates a courier consignment on Pathao. */
export async function createPathaoOrder(payload: PathaoOrderPayload): Promise<PathaoOrderResponse> {
  const accessToken = await getAccessToken();

  const data = await pathaoPost<{ code: number; message: string; data: PathaoOrderResponse }>(
    '/aladdin/api/v1/orders/',
    payload as unknown as Record<string, unknown>,
    accessToken,
  );

  if (!data?.data?.consignment_id) {
    throw new Error(`Pathao order creation failed: ${data?.message || 'no consignment_id returned'}`);
  }

  return data.data;
}

// ── Lookup helpers (public) ────────────────────────────────────────────────

export async function getPathaoCities(): Promise<unknown> {
  const accessToken = await getAccessToken();
  return pathaoGet('/aladdin/api/v1/countries/cities?country_id=BD', accessToken);
}

export async function getPathaoZones(cityId: number): Promise<unknown> {
  const accessToken = await getAccessToken();
  return pathaoGet(`/aladdin/api/v1/cities/${cityId}/zones/`, accessToken);
}

export async function getPathaoStores(): Promise<unknown> {
  const accessToken = await getAccessToken();
  return pathaoGet('/aladdin/api/v1/stores/', accessToken);
}
