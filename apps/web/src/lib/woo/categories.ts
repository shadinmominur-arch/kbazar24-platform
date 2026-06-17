import { unstable_cache } from 'next/cache';
import { getWooSafeMessage, logWooError, wooClient } from './client';
import { transformCategory } from './transformers';
import type { WooCategory } from './types';

const _getCategoriesCached = unstable_cache(
  async (perPage: number, parent: number | undefined, hideEmpty: boolean): Promise<WooCategory[]> => {
    try {
      const response = await wooClient.get('/products/categories', {
        params: {
          per_page: perPage,
          hide_empty: hideEmpty,
          orderby: 'count',
          order: 'desc',
          ...(parent !== undefined ? { parent } : {}),
        },
      });
      if (!Array.isArray(response.data)) return [];
      return response.data.map(transformCategory);
    } catch (error) {
      throw new Error(getWooSafeMessage('getCategories', error));
    }
  },
  ['woo-categories'],
  { revalidate: 3600, tags: ['categories'] },
);

export async function getCategories(params: {
  per_page?: number;
  parent?: number;
  hide_empty?: boolean;
} = {}): Promise<WooCategory[]> {
  try {
    return await _getCategoriesCached(
      params.per_page ?? 100,
      params.parent,
      params.hide_empty ?? true,
    );
  } catch (error) {
    logWooError('getCategories', error);
    return [];
  }
}

const _getCategoryBySlugCached = unstable_cache(
  async (slug: string): Promise<WooCategory | null> => {
    try {
      const response = await wooClient.get('/products/categories', { params: { slug } });
      const categories = Array.isArray(response.data) ? response.data.map(transformCategory) : [];
      return categories[0] || null;
    } catch (error) {
      throw new Error(getWooSafeMessage('getCategoryBySlug', error));
    }
  },
  ['woo-category-by-slug'],
  { revalidate: 600, tags: ['categories'] },
);

export async function getCategoryBySlug(slug: string): Promise<WooCategory | null> {
  try {
    return await _getCategoryBySlugCached(slug);
  } catch (error) {
    logWooError('getCategoryBySlug', error, { slug });
    return null;
  }
}
