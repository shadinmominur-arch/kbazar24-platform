import { unstable_cache } from 'next/cache';
import { logWooError, wooClient, WOO_READ_TIMEOUT_MS } from './client';
import { getProducts } from './products';
import type { WooProduct, WooRawTerm } from './types';

const ORIGIN_ATTRIBUTE_ID = 9;
export interface WooOriginTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
}

const _getOriginTermsCached = unstable_cache(
  async (): Promise<WooOriginTerm[]> => {
    const response = await wooClient.get(`/products/attributes/${ORIGIN_ATTRIBUTE_ID}/terms`, {
      params: {
        per_page: 100,
        orderby: 'count',
        order: 'desc',
      },
      timeout: WOO_READ_TIMEOUT_MS,
    });
    return Array.isArray(response.data)
      ? response.data.map((term: WooRawTerm) => ({
          id: Number(term.id),
          name: String(term.name || ''),
          slug: String(term.slug || ''),
          count: Number(term.count || 0),
        }))
      : [];
  },
  ['woo-origin-terms'],
  { revalidate: 3600, tags: ['products'] },
);

export async function getOriginTermCounts(): Promise<Record<string, number>> {
  try {
    const terms = await _getOriginTermsCached();
    return Object.fromEntries(terms.map((term) => [term.slug, term.count]));
  } catch (error) {
    logWooError('getOriginTermCounts', error);
    return {};
  }
}

export async function getOriginTermBySlug(slug: string): Promise<{ id: number; name: string; slug: string } | null> {
  try {
    const response = await wooClient.get(`/products/attributes/${ORIGIN_ATTRIBUTE_ID}/terms`, {
      params: {
        slug,
        per_page: 1,
      },
      timeout: WOO_READ_TIMEOUT_MS,
    });
    const term = Array.isArray(response.data) ? response.data[0] : null;
    return term ? { id: Number(term.id), name: String(term.name || ''), slug: String(term.slug || '') } : null;
  } catch (error) {
    logWooError('getOriginTermBySlug', error, { slug });
    return null;
  }
}

export async function getProductsByOriginTermSlug(
  slug: string,
  page = 1,
  perPage = 24,
  extras?: { orderby?: 'date'|'price'|'popularity'|'rating'|'title'; order?: 'asc'|'desc'; min_price?: string; max_price?: string; stock_status?: 'instock'|'outofstock'|'onbackorder' },
): Promise<{
  products: WooProduct[];
  total: number;
  totalPages: number;
}> {
  const term = await getOriginTermBySlug(slug);
  if (!term) return { products: [], total: 0, totalPages: 0 };

  return getProducts({
    page,
    per_page: perPage,
    orderby: 'date',
    order: 'desc',
    attribute: 'pa_origin',
    attribute_term: String(term.id),
    ...extras,
  });
}

export async function getProductsByCategory(categoryId: number, limit = 5): Promise<WooProduct[]> {
  try {
    const { products } = await getProducts({
      category: categoryId.toString(),
      per_page: limit
    });
    return products;
  } catch (error) {
    logWooError('getProductsByCategory', error, { categoryId });
    return [];
  }
}

// Map origins to their associated brands for product fetching
const ORIGIN_BRAND_MAP: Record<string, string[]> = {
  'korea': ['CosRx', 'Some By Mi', 'Purito', 'ANUA', 'Dr.Althea', 'ISNTREE', 'Skin1004'],
  'japan': ['Rohto', 'Hada Labo', 'Kose', 'Shiseido', 'Tatcha'],
  'uk': ['CeraVe', 'The Ordinary', 'Paula\'s Choice'],
  'usa': ['CeraVe', 'Cetaphil', 'Neutrogena'],
  'france': ['Bioderma', 'Eucerin', 'La Roche-Posay'],
  'india': ['Minimalist', 'Dot & Key', 'The Derma Co', 'Mamaearth', 'Wishcare', 'Aqualogica', 'Blessed Botanicals'],
  'bangladesh': ['Dabo', 'Ponds', 'Himalaya']
};

export async function getProductsByOrigin(originSlug: string, limit = 4): Promise<WooProduct[]> {
  try {
    // First, try searching by origin name directly
    const { products: searchResults } = await getProducts({
      search: originSlug,
      per_page: limit
    });

    if (searchResults.length > 0) {
      return searchResults;
    }

    // If no results from search, try fetching from brands associated with this origin
    const brands = ORIGIN_BRAND_MAP[originSlug.toLowerCase()] || [];
    const allProducts: WooProduct[] = [];

    for (const brand of brands) {
      if (allProducts.length >= limit) break;
      const { products: brandProducts } = await getProducts({
        search: brand,
        per_page: limit - allProducts.length
      });
      allProducts.push(...brandProducts);
    }

    return allProducts.slice(0, limit);
  } catch (error) {
    logWooError('getProductsByOrigin', error, { originSlug });
    return [];
  }
}
