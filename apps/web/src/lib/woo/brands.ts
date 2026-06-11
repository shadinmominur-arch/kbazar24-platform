import axios from 'axios';
import { IS_NEXT_BUILD, PUBLIC_SITE_URL, WOO_READ_TIMEOUT_MS, isBlockedFallbackStatus, isWooNetworkError, logWooError, withRetry, wordpressRestClient } from './client';
import { decodeHtmlEntities } from './transformers';
import { getProducts } from './products';
import type { WooBrand, WooProduct, WooRawIdOnly, WooRawTerm } from './types';

export async function getBrands(params: {per_page?: number;
  hide_empty?: boolean;
  orderby?: 'count' | 'name' | 'slug' | 'id';
  order?: 'asc' | 'desc';
} = {}): Promise<WooBrand[]> {
  const baseParams = {
    per_page: 100,
    hide_empty: true,
    orderby: 'count',
    order: 'desc',
    ...params,
  };

  const parseBrands = (data: unknown) => {
    if (!Array.isArray(data)) return [];
    return data
      .map((brand: WooRawTerm) => ({
        id: Number(brand.id),
        name: decodeHtmlEntities(brand.name).trim(),
        slug: String(brand.slug || '').trim(),
        count: Number(brand.count || 0),
        link: typeof brand.link === 'string' ? brand.link : undefined,
      }))
      .filter((brand: WooBrand) => brand.id && brand.name && brand.slug);
  };

  for (const attempt of ['internal', 'public'] as const) {
    try {
      const allBrands: WooBrand[] = [];
      for (let page = 1; page <= 10; page++) {
        const queryParams = { ...baseParams, page };
        let response;
        if (attempt === 'public') {
          response = await axios.get(`${PUBLIC_SITE_URL}/wp-json/wp/v2/product_brand`, {
            params: queryParams,
            timeout: WOO_READ_TIMEOUT_MS,
          });
        } else {
          response = await wordpressRestClient.get('/product_brand', {
            params: queryParams,
            timeout: WOO_READ_TIMEOUT_MS,
          });
        }
        const pageData: WooRawTerm[] = Array.isArray(response.data) ? response.data : [];
        allBrands.push(...parseBrands(pageData));
        if (pageData.length < 100) break;
      }
      const seen = new Map<number, WooBrand>();
      for (const b of allBrands) {
        const existing = seen.get(b.id);
        if (!existing || b.count > existing.count) seen.set(b.id, b);
      }
      const brands = [...seen.values()];
      if (brands.length > 0) return brands;
    } catch (error) {
      const candidate = error as { cause?: { code?: string }; message?: string };
      const isSocketError = candidate?.cause?.code === 'ECONNRESET' || candidate?.message?.includes('socket hang up');
      if (IS_NEXT_BUILD) return [];
      if (attempt === 'internal' && isSocketError) continue;
      logWooError('getBrands', error);
      if (attempt === 'public') return [];
    }
  }
  return [];
}

export async function getBrandBySlug(slug: string): Promise<WooBrand | null> {
  const safeSlug = String(slug || '').trim();
  if (!safeSlug) return null;

  const queryParams = {
    slug: safeSlug,
    hide_empty: true,
    per_page: 10,
  };

  const parseBrands = (data: unknown): WooBrand[] => {
    if (!Array.isArray(data)) return [];
    return data
      .map((brand: WooRawTerm) => ({
      id: Number(brand.id),
      name: decodeHtmlEntities(brand.name).trim(),
      slug: String(brand.slug || '').trim(),
      count: Number(brand.count || 0),
      link: typeof brand.link === 'string' ? brand.link : undefined,
      }))
      .filter((brand: WooBrand) => brand.id && brand.name && brand.slug);
  };

  const findExactBrand = (data: unknown): WooBrand | null => {
    return parseBrands(data).find((brand) => brand.slug === safeSlug) || null;
  };

  const fetchBrandTerms = async (
    attempt: 'internal' | 'public',
    params: Record<string, string | number | boolean>,
  ) => {
    return attempt === 'public'
      ? axios.get(`${PUBLIC_SITE_URL}/wp-json/wp/v2/product_brand`, {
        params,
        timeout: WOO_READ_TIMEOUT_MS,
      })
      : wordpressRestClient.get('/product_brand', {
        params,
        timeout: WOO_READ_TIMEOUT_MS,
      });
  };

  const findByPagedScan = async (attempt: 'internal' | 'public'): Promise<WooBrand | null> => {
    for (let page = 1; page <= 20; page += 1) {
      const response = await fetchBrandTerms(attempt, {
        hide_empty: true,
        per_page: 100,
        page,
      });
      const brand = findExactBrand(response.data);
      if (brand) return brand;

      const totalPages = Number(response.headers?.['x-wp-totalpages'] || 0);
      const terms = Array.isArray(response.data) ? response.data : [];
      if ((totalPages && page >= totalPages) || terms.length < 100) break;
    }

    return null;
  };

  let shouldTryPublicFallback = false;

  for (const attempt of ['internal', 'public'] as const) {
    if (attempt === 'public' && !shouldTryPublicFallback) return null;

    try {
      const response = await fetchBrandTerms(attempt, queryParams);

      const brand = findExactBrand(response.data) || await findByPagedScan(attempt);
      if (brand) return brand;
      if (attempt === 'internal') return null;
    } catch (error) {
      if (attempt === 'internal' && isWooNetworkError(error)) {
        shouldTryPublicFallback = true;
        // Brief pause before hitting public URL — avoids hammering both endpoints
        // simultaneously when internal is transiently down.
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      if (attempt === 'public' && isBlockedFallbackStatus(error)) return null;
      logWooError('getBrandBySlug', error, { slug: safeSlug });
      if (attempt === 'public') return null;
    }
  }

  return null;
}

export async function getProductIdsByBrand(brandId: number, page = 1, perPage = 24): Promise<{
  ids: number[];
  total: number;
  totalPages: number;
}> {
  try {
    const response = await withRetry(
      () => wordpressRestClient.get('/product', {
        params: { product_brand: brandId, status: 'publish', per_page: perPage, page, _fields: 'id' },
        timeout: WOO_READ_TIMEOUT_MS,
      }),
      'getProductIdsByBrand',
    );
    return {
      ids: Array.isArray(response.data) ? response.data.map((item: WooRawIdOnly) => Number(item.id)).filter(Boolean) : [],
      total: parseInt(response.headers['x-wp-total'] || '0'),
      totalPages: parseInt(response.headers['x-wp-totalpages'] || '0'),
    };
  } catch (error) {
    logWooError('getProductIdsByBrand', error, { brandId });
    return { ids: [], total: 0, totalPages: 0 };
  }
}

export async function getAllProductIdsByBrand(brandId: number): Promise<number[]> {
  const ids: number[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const result = await getProductIdsByBrand(brandId, page, 100);
    ids.push(...result.ids);
    if (!result.ids.length || page >= result.totalPages) break;
  }
  return [...new Set(ids)];
}

export async function getProductsByProductBrand(brandId: number, page = 1, perPage = 24): Promise<{
  products: WooProduct[];
  total: number;
  totalPages: number;
}> {
  const { ids, total, totalPages } = await getProductIdsByBrand(brandId, page, perPage);
  if (!ids.length) return { products: [], total, totalPages };

    const { products } = await getProducts({
    include: ids.join(','),
    per_page: perPage,
    orderby: 'include',
  });
  const order = new Map(ids.map((id, index) => [id, index]));
  products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  return { products, total, totalPages };
}
