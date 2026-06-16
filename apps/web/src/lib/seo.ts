/**
 * Rank Math SEO utility — fetches per-page SEO metadata via WPGraphQL + Rank Math.
 * Uses WOO_INTERNAL_URL (loopback) with explicit Host header so Nginx routes
 * correctly without triggering the IP-redirect rule.
 */

const BASE_URL = 'https://kbazar24.com';
const DEFAULT_INTERNAL_WORDPRESS_URL = process.env.NODE_ENV === 'production' ? 'http://127.0.0.1' : '';
const WORDPRESS_URL = process.env.WOO_INTERNAL_URL || DEFAULT_INTERNAL_WORDPRESS_URL;
const GRAPHQL_URL = WORDPRESS_URL
  ? `${WORDPRESS_URL.replace(/\/$/, '')}/graphql`
  : `${BASE_URL}/graphql`;

interface RankMathSeo {
  title: string | null;
  description: string | null;
  openGraph: {
    image: { url: string } | null;
  } | null;
}

interface ProductSeoResponse {
  product: { seo: RankMathSeo } | null;
}

interface CategorySeoResponse {
  productCategory: {
    name: string;
    seo: RankMathSeo;
  } | null;
}

const PRODUCT_SEO_QUERY = `
  query ProductSeo($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      seo {
        title
        description
        openGraph { image { url } }
      }
    }
  }
`;

const CATEGORY_SEO_QUERY = `
  query CategorySeo($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      name
      seo {
        title
        description
        openGraph { image { url } }
      }
    }
  }
`;

async function rankMathFetch<T>(
  query: string,
  variables: Record<string, string>,
): Promise<T | null> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(isLocalGraphQLUrl(GRAPHQL_URL) ? { Host: 'kbazar24.com' } : {}),
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = await res.json() as { data?: T; errors?: unknown[] };
    if (json.errors?.length) return null;
    return json.data ?? null;
  } catch {
    return null;
  }
}

function isLocalGraphQLUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname;
    return hostname === '127.0.0.1' || hostname === 'localhost';
  } catch {
    return false;
  }
}

function stripRankMathSuffix(raw: string): string {
  return raw
    .replace(/\s*[-–—|]\s*Kbazar Korean Cosmetics Store\s*$/i, '')
    .replace(/\s*[-–—|]\s*Kbazar\s*$/i, '')
    .trim();
}

/** Category: "Toners - Kbazar Korean Cosmetics Store" → "Toners Prices in Bangladesh | Kbazar" */
function reformatCategoryTitle(raw: string | null, fallback: string): string {
  if (!raw?.trim()) return fallback;
  const stripped = stripRankMathSuffix(raw);
  if (stripped.length < 3) return fallback;
  // Add "Prices in Bangladesh" if not already present
  const hasBangladesh = /in bangladesh/i.test(stripped);
  const hasPrices = /price/i.test(stripped);
  let core = stripped;
  if (!hasBangladesh) core = `${stripped} Prices in Bangladesh`;
  else if (!hasPrices) core = stripped.replace(/in bangladesh/i, 'Prices in Bangladesh');
  return `${core} | Kbazar`;
}

export async function getProductSeo(
  slug: string,
  fallbacks: { name: string; description?: string; imageUrl?: string },
): Promise<{ title: string; description: string; canonical: string; ogImage: string }> {
  const canonical = `${BASE_URL}/shop/${slug}`;
  const titleFallback = `${fallbacks.name} Price in Bangladesh | Kbazar`;
  const descFallback = fallbacks.description
    ? fallbacks.description.replace(/<[^>]*>/g, '').trim().slice(0, 160)
    : `Buy ${fallbacks.name} in Bangladesh from Kbazar. 100% authentic import. COD available.`;

  const data = await rankMathFetch<ProductSeoResponse>(PRODUCT_SEO_QUERY, { slug });
  const seo = data?.product?.seo;

  return {
    title: titleFallback,
    description: seo?.description || descFallback,
    canonical,
    ogImage: seo?.openGraph?.image?.url || fallbacks.imageUrl || '',
  };
}

export async function getCategorySeo(
  slug: string,
  categoryName?: string,
): Promise<{ title: string; description: string; canonical: string; ogImage: string }> {
  const canonical = `${BASE_URL}/category/${slug}`;

  const data = await rankMathFetch<CategorySeoResponse>(CATEGORY_SEO_QUERY, { slug });
  const seo = data?.productCategory?.seo;
  const name = data?.productCategory?.name || categoryName || slug;

  const titleFallback = `${name} Prices in Bangladesh | Kbazar`;
  const descFallback = `Buy original ${name} skincare in Bangladesh at Kbazar. Shop authentic products with COD, fast delivery, and trusted prices.`;

  const rawTitle = seo?.title ?? null;
  const isBroken =
    !rawTitle ||
    rawTitle.trim().startsWith('-') ||
    rawTitle.trim().startsWith('–') ||
    rawTitle.trim().length < 4;

  return {
    title: isBroken ? titleFallback : reformatCategoryTitle(rawTitle, titleFallback),
    description: seo?.description || descFallback,
    canonical,
    ogImage: seo?.openGraph?.image?.url || '',
  };
}
