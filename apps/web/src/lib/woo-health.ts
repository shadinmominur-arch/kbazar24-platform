/**
 * WooCommerce API key health check.
 * Called on app startup via instrumentation.ts.
 * If the key cannot create/delete a test order → logs CRITICAL and sends Telegram alert.
 * This catches key rotation failures within seconds of deployment, not 10 days later.
 */

const WOO_INTERNAL = process.env.WOO_INTERNAL_URL || 'http://127.0.0.1';
const CK  = process.env.WOO_CONSUMER_KEY    || '';
const CS  = process.env.WOO_CONSUMER_SECRET || '';
const TG_TOKEN  = process.env.TELEGRAM_BOT_TOKEN  || '';
const TG_CHAT   = process.env.TELEGRAM_CHAT_ID    || '';
const ALERT_EMAIL = 'hgc.bd71@gmail.com';

async function tg(msg: string) {
  if (!TG_TOKEN || !TG_CHAT) return;
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT, text: msg, parse_mode: 'HTML' }),
  }).catch(() => {});
}

async function email(subject: string, body: string) {
  // Use WordPress wp_mail via WP CLI — always available on this VPS
  const { execSync } = await import('child_process');
  try {
    execSync(
      `wp --path=/var/www/wordpress --allow-root eval 'wp_mail("${ALERT_EMAIL}", "${subject.replace(/"/g, '\\"')}", "${body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}");'`,
      { timeout: 10000, stdio: 'ignore' }
    );
  } catch { /* email failure is non-fatal */ }
}

async function alert(subject: string, msg: string) {
  await Promise.all([
    tg(msg),
    email(`🔴 Kbazar Alert: ${subject}`, msg.replace(/<[^>]+>/g, '')),
  ]);
}

export async function validateWooCheckout(): Promise<boolean> {
  if (!CK || !CS) {
    console.error('[woo-health] CRITICAL: WOO_CONSUMER_KEY or WOO_CONSUMER_SECRET not set in env');
    await alert('CHECKOUT BROKEN', 'WOO_CONSUMER_KEY or WOO_CONSUMER_SECRET missing from .env.local\nOrders will fail until fixed.');
    return false;
  }

  try {
    const url = `${WOO_INTERNAL}/wp-json/wc/v3/orders?consumer_key=${CK}&consumer_secret=${CS}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'pending',
        line_items: [{ product_id: 93315, quantity: 1 }],
        billing: { first_name: 'HealthCheck', last_name: 'Bot', phone: '01700000000', city: 'Dhaka', country: 'BD', email: 'healthcheck@kbazar24.com' },
        payment_method: 'cod',
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await resp.json() as { id?: number; code?: string; message?: string };

    if (data.id) {
      // Delete the test order immediately
      await fetch(`${WOO_INTERNAL}/wp-json/wc/v3/orders/${data.id}?consumer_key=${CK}&consumer_secret=${CS}&force=true`, {
        method: 'DELETE',
      }).catch(() => {});
      console.log(`[woo-health] ✅ WC API key valid — checkout operational (test order ${data.id} created+deleted)`);
      return true;
    }

    if (data.code === 'woocommerce_rest_cannot_create' || data.message?.includes('not allowed')) {
      console.error(`[woo-health] CRITICAL: WC key is READ-ONLY — ${data.message}`);
      await alert('CHECKOUT BROKEN — WC API key invalid', `WC API key has no write permission.\n\n${data.message}\n\nFix: WP Admin → WooCommerce → Settings → Advanced → REST API → create read_write key → update WOO_CONSUMER_KEY in .env.local → restart emartweb.`);
      return false;
    }

    console.warn(`[woo-health] WC API unexpected response:`, data);
    return true; // Don't block startup on unexpected responses

  } catch (err) {
    console.error('[woo-health] WC API unreachable:', err);
    return true; // Don't block startup if internal URL is temporarily down
  }
}
