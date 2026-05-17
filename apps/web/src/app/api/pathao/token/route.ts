/**
 * GET  /api/pathao/token   — return the currently stored token info (no secret)
 * POST /api/pathao/token   — force-fetch a new token (password grant)
 *
 * Both require the internal REVALIDATE_SECRET header for protection.
 */
import { NextRequest, NextResponse } from 'next/server';
import { fetchNewToken, getAccessToken } from '@/lib/pathao';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false;
  return (
    req.headers.get('x-revalidate-secret') === secret ||
    req.nextUrl.searchParams.get('token') === secret
  );
}

/** Returns masked token info — confirms a valid token exists without exposing it. */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accessToken = await getAccessToken();
    return NextResponse.json({
      ok: true,
      token_preview: `${accessToken.slice(0, 8)}…`,
      at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Token fetch failed' }, { status: 500 });
  }
}

/** Forces a full re-authentication via password grant and persists the result. */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = await fetchNewToken();
    return NextResponse.json({
      ok: true,
      token_preview: `${token.access_token.slice(0, 8)}…`,
      expires_at: new Date(token.expires_at).toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Token fetch failed' }, { status: 500 });
  }
}
