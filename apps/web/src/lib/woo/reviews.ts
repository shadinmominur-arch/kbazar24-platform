import { unstable_cache } from 'next/cache';
import { logWooError, wooClient, wooWriteClient } from './client';
import { transformProductReview } from './transformers';
import type { WooProductReview } from './types';

const _getProductReviewsCached = unstable_cache(
  async (productId: number): Promise<WooProductReview[]> => {
    const response = await wooClient.get('/products/reviews', {
      params: { product: productId, per_page: 50, status: 'approved' },
    });
    return Array.isArray(response.data)
      ? response.data.map(transformProductReview).filter((r) => r.id && r.rating > 0)
      : [];
  },
  ['product-reviews'],
  { revalidate: 3600 },
);

export async function getProductReviews(productId: number): Promise<WooProductReview[]> {
  try {
    return await _getProductReviewsCached(productId);
  } catch (error) {
    logWooError('getProductReviews', error, { productId });
    return [];
  }
}

export async function getRecentProductReviews(limit = 12): Promise<WooProductReview[]> {
  try {
    const response = await wooClient.get('/products/reviews', {
      params: {
        per_page: limit,
        status: 'approved',
        orderby: 'date_gmt',
        order: 'desc',
      },
    });

    return Array.isArray(response.data)
      ? response.data.map(transformProductReview).filter((review) => review.id && review.rating > 0)
      : [];
  } catch (error) {
    logWooError('getRecentProductReviews', error, { limit });
    return [];
  }
}

export async function createProductReview(data: {
  product_id: number;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
}): Promise<WooProductReview | null> {
  try {
    const response = await wooWriteClient.post('/products/reviews', data);
    return transformProductReview(response.data);
  } catch (error) {
    logWooError('createProductReview', error, { productId: data.product_id });
    return null;
  }
}
