import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getWooSafeMessage, logWooError, withRetry, wooClient } from './client';
import { transformImageUrls } from './transformers';
import type { ProductsParams, WooProduct } from './types';

const _getProductsCached = unstable_cache(async (params: ProductsParams): Promise<{ products: WooProduct[]; total: number; totalPages: number }> => {
    const response = await withRetry(
      () => wooClient.get('/products', { params: { per_page: 20, status: 'publish', ...params } }),
      'getProducts',
    ).catch((error) => {
      throw new Error(getWooSafeMessage('getProducts', error));
    });
    return {
      products: transformImageUrls(response.data || []),
      total: parseInt(response.headers['x-wp-total'] || '0'),
      totalPages: parseInt(response.headers['x-wp-totalpages'] || '0'),
    };
  },
  ['woo-products'],
  {
    revalidate: 3600,
    // 'products' = global tag (flush all lists); param-scoped tags allow targeted revalidation.
    // revalidateTag('category-face-cleansers') only flushes that category's cached pages.
    // revalidateTag('brand-cosrx') only flushes COSRX product list pages.
    tags: ['products'],
  },
);

export async function getProducts(params: ProductsParams = {}): Promise<{
  products: WooProduct[];
  total: number;
  totalPages: number;
}> {
  try {
    return await _getProductsCached(params);
  } catch (error) {
    logWooError('getProducts', error);
    return { products: [], total: 0, totalPages: 0 };
  }
}

export async function getCatalogProductCount(): Promise<number> {
  const { total } = await getProducts({ per_page: 1 });
  return total;
}

export function formatCatalogProductCount(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return '';
  return count.toLocaleString('en-BD');
}

export const getProduct = cache(async (slug: string): Promise<WooProduct | null> => {
  try {
    const response = await withRetry(
      () => wooClient.get('/products', { params: { slug, status: 'publish' } }),
      'getProduct',
    );
    const products = transformImageUrls(response.data || []);
    return products[0] || null;
  } catch (error) {
    logWooError('getProduct', error, { slug });
    return null;
  }
});

export const getCachedProduct = (slug: string) =>
  unstable_cache(
    () => getProduct(slug),
    [`product-${slug}`],
    { tags: [`product-${slug}`, 'products'], revalidate: 86400 }
  )();

export async function getProductById(id: number): Promise<WooProduct | null> {
  try {
    if (!id || isNaN(id)) { console.error('getProductById called with invalid id:', id); return null; }
    const response = await withRetry(
      () => wooClient.get(`/products/${id}`),
      'getProductById',
    );
    const products = transformImageUrls(response.data ? [response.data] : []);
    return products[0] || null;
  } catch (error) {
    logWooError('getProductById', error, { id });
    return null;
  }
}
export async function getFeaturedProducts(limit = 8): Promise<WooProduct[]> {
  const { products } = await getProducts({ featured: true, per_page: limit });
  return products;
}

export async function getSaleProducts(limit = 8): Promise<WooProduct[]> {
  const { products } = await getProducts({ on_sale: true, per_page: limit });
  return products;
}

export async function getBestSellingProducts(limit = 8): Promise<WooProduct[]> {
  const { products } = await getProducts({ orderby: 'popularity', per_page: limit });
  return products;
}

export async function getTopRatedProducts(limit = 8): Promise<WooProduct[]> {
  const { products } = await getProducts({ orderby: 'rating', per_page: limit });
  return products;
}

export async function getNewArrivals(limit = 8): Promise<WooProduct[]> {
  const { products } = await getProducts({ orderby: 'date', order: 'desc', per_page: limit });
  return products;
}

export async function searchProducts(query: string, page = 1, perPage = 20): Promise<{
  products: WooProduct[];
  total: number;
  totalPages: number;
}> {
  return getProducts({ search: query, page, per_page: perPage });
}

export async function getProductsByBrand(brandName: string, limit = 5): Promise<WooProduct[]> {
  try {
    const { products } = await getProducts({
      search: brandName,
      per_page: limit
    });
    return products;
  } catch (error) {
    logWooError('getProductsByBrand', error, { brandName });
    return [];
  }
}
