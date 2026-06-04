/**
 * Next.js instrumentation — runs on server startup.
 * Validates WooCommerce API key has write permission.
 * If broken: logs CRITICAL + sends Telegram alert immediately.
 */
export async function register() {
  // Only run on Node.js runtime, not Edge
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== 'nodejs') return;

  try {
    const { validateWooCheckout } = await import('./src/lib/woo-health');
    await validateWooCheckout();
  } catch (e) {
    console.error('[instrumentation] woo-health failed to load:', e);
  }
}
