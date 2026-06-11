import { formatBDT } from '@/lib/formatters';
import { STORE_POLICIES } from '@/config/storePolicies';
import { LEGACY_IP_HOST, LOCAL_WORDPRESS_HOSTS, PUBLIC_SITE_URL } from './client';
import type {
  WooCategory,
  WooCoupon,
  WooImage,
  WooMetaData,
  WooProduct,
  WooProductBrand,
  WooProductReview,
  WooRawAttribute,
  WooRawCategory,
  WooRawCoupon,
  WooRawImage,
  WooRawMetaData,
  WooRawProduct,
  WooRawProductBrand,
  WooRawProductReview,
} from './types';

export function decodeHtmlEntities(value: unknown): string {
  if (value === null || value === undefined) return '';

  let text = String(value);
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    ndash: '-',
    mdash: '-',
    hellip: '...',
    rsquo: "'",
    lsquo: "'",
    rdquo: '"',
    ldquo: '"',
  };

  for (let i = 0; i < 3; i += 1) {
    const next = text
      .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
        const normalized = entity.toLowerCase();
        if (normalized.startsWith('#x')) {
          const code = parseInt(normalized.slice(2), 16);
          return Number.isFinite(code) ? String.fromCodePoint(code) : match;
        }
        if (normalized.startsWith('#')) {
          const code = parseInt(normalized.slice(1), 10);
          return Number.isFinite(code) ? String.fromCodePoint(code) : match;
        }
        return entities[normalized] ?? match;
      })
      .replace(/\s*;amp\s*/gi, ' & ')
      .replace(/\s+/g, ' ')
      .trim();

    if (next === text) break;
    text = next;
  }

  return text;
}

export function alignPolicyCopy(value: string): string {
  if (!value) return '';

  const deliveryText = STORE_POLICIES.shipping.pdpDeliveryText;

  return value
    .replace(/Dhaka\s+1[-–]\s*2\s+days?\s+delivery/gi, deliveryText)
    .replace(/delivered\s+to\s+Dhaka\s+in\s+1[-–]\s*2\s+days/gi, `delivered with ${deliveryText}`)
    .replace(/1[-–]\s*2\s+days?\s+nationwide/gi, STORE_POLICIES.shipping.overallDeliveryEstimate)
    .replace(/Within\s+1[-–]\s*3\s+Days/gi, STORE_POLICIES.shipping.overallDeliveryEstimate)
    .replace(/COD accepted\s+·\s+64 districts/gi, 'COD available')
    .replace(/Dhaka Next Day Nationwide/gi, 'Dhaka next-day · Nationwide 3–5 days')
    .replace(/free shipping when an active promotion is enabled/gi, `free shipping over ${formatBDT(STORE_POLICIES.shipping.freeShippingThreshold)}`);
}

export function transformImage(image: WooRawImage): WooImage {
  if (!image) return image;

  return {
    id: Number(image.id || 0),
    src: image.src ? normalizePublicAssetUrl(String(image.src)) : '',
    name: decodeHtmlEntities(image.name),
    alt: decodeHtmlEntities(image.alt),
  };
}

export function transformCategory(category: WooRawCategory): WooCategory {
  if (!category) return category;

  return {
    id: Number(category.id || 0),
    name: decodeHtmlEntities(category.name),
    slug: String(category.slug || ''),
    image: category.image ? transformImage(category.image) : category.image,
    count: typeof category.count === 'number' ? category.count : undefined,
  };
}

export function transformProductBrand(brand: WooRawProductBrand): WooProductBrand {
  return {
    id: Number(brand?.id || 0),
    name: decodeHtmlEntities(brand?.name),
    slug: String(brand?.slug || ''),
  };
}

const PUBLIC_PRODUCT_META_KEYS = new Set([
  '_woodmart_product_custom_tab_title',
  '_woodmart_product_custom_tab_content',
  '_woodmart_product_custom_tab_title_2',
  '_woodmart_product_custom_tab_content_2',
  'custom_tab_content1',
  'custom_tab_content2',
  '_emart_ingredients',
  '_emart_how_to_use',
  '_emart_product_faq',
  '_emart_meta_description',
  '_wc_facebook_enhanced_catalog_attributes_ingredients',
  '_wc_facebook_enhanced_catalog_attributes_instructions',
  '_wc_facebook_enhanced_catalog_attributes_care_instructions',
  '_structured_description',
  '_rank_math_title',
  '_rank_math_description',
  '_rank_math_focus_keyword',
  '_brand_name',
  'fb_product_description',
  'fb_rich_text_description',
  'meta description',
  'rank_math_description',
]);

export function transformMetaValue(value: unknown): unknown {
  return typeof value === 'string' ? alignPolicyCopy(decodeHtmlEntities(value)) : value;
}

export function transformProductMetaData(metaData: unknown): WooMetaData[] {
  if (!Array.isArray(metaData)) return [];

  return metaData
    .map((meta): WooRawMetaData => meta as WooRawMetaData)
    .filter((meta) => PUBLIC_PRODUCT_META_KEYS.has(String(meta.key || '')))
    .map((meta) => ({
      id: typeof meta.id === 'number' ? meta.id : undefined,
      key: String(meta.key || ''),
      value: transformMetaValue(meta.value),
    }));
}

export function transformProduct(product: WooRawProduct): WooProduct {
  if (!product) return product;

  return {
    id: Number(product.id || 0),
    name: decodeHtmlEntities(product.name),
    slug: String(product.slug || ''),
    permalink: product.permalink ? normalizePublicAssetUrl(String(product.permalink)) : '',
    type: String(product.type || ''),
    parent_id: Number(product.parent_id || 0),
    status: String(product.status || ''),
    date_created: product.date_created,
    date_modified: product.date_modified,
    sku: product.sku ? decodeHtmlEntities(product.sku) : '',
    price: String(product.price || ''),
    regular_price: String(product.regular_price || ''),
    sale_price: String(product.sale_price || ''),
    on_sale: Boolean(product.on_sale),
    purchasable: product.purchasable !== false,
    stock_status: product.stock_status || 'instock',
    manage_stock: product.manage_stock === true,
    stock_quantity: product.stock_quantity ?? null,
    backorders: String(product.backorders || 'no'),
    description: alignPolicyCopy(decodeHtmlEntities(product.description)),
    short_description: alignPolicyCopy(decodeHtmlEntities(product.short_description)),
    images: Array.isArray(product.images) ? product.images.map(transformImage) : [],
    categories: Array.isArray(product.categories) ? product.categories.map(transformCategory) : [],
    brands: Array.isArray(product.brands)
      ? product.brands.map(transformProductBrand).filter((brand: WooProductBrand) => brand.id && brand.name && brand.slug)
      : [],
    attributes: Array.isArray(product.attributes)
      ? product.attributes.map((attribute: WooRawAttribute) => ({
        id: Number(attribute.id || 0),
        name: decodeHtmlEntities(attribute.name),
        options: Array.isArray(attribute.options)
          ? attribute.options.map((option: unknown) => decodeHtmlEntities(option))
          : [],
      }))
      : [],
    meta_data: transformProductMetaData(product.meta_data),
    average_rating: String(product.average_rating || '0'),
    rating_count: Number(product.rating_count || 0),
    featured: Boolean(product.featured),
    ...(product.emart_version ? { emart_version: product.emart_version as WooProduct['emart_version'] } : {}),
    ...(Array.isArray(product.concern_terms) && product.concern_terms.length > 0
      ? {
          concern_terms: product.concern_terms.map((t) => ({
            name: String(t.name || ''),
            slug: String(t.slug || ''),
          })),
        }
      : {}),
  };
}

export function stripReviewHtml(value: unknown): string {
  return decodeHtmlEntities(String(value || ''))
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|li)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function transformProductReview(review: WooRawProductReview): WooProductReview {
  return {
    id: Number(review?.id || 0),
    product_id: Number(review?.product_id || review?.product || 0),
    reviewer: decodeHtmlEntities(review?.reviewer || 'Verified customer'),
    reviewer_email: review?.reviewer_email ? String(review.reviewer_email) : undefined,
    review: stripReviewHtml(review?.review),
    rating: Number(review?.rating || 0),
    date_created: String(review?.date_created || ''),
    verified: Boolean(review?.verified),
    status: typeof review?.status === 'string' ? review.status : undefined,
  };
}

export function transformCoupon(coupon: WooRawCoupon): WooCoupon {
  return {
    id: Number(coupon?.id || 0),
    code: String(coupon?.code || '').trim(),
    amount: String(coupon?.amount || ''),
    discount_type: String(coupon?.discount_type || ''),
    date_expires: coupon?.date_expires ? String(coupon.date_expires) : null,
    minimum_amount: coupon?.minimum_amount ? String(coupon.minimum_amount) : '',
    maximum_amount: coupon?.maximum_amount ? String(coupon.maximum_amount) : '',
  };
}

// Keep product images and text on the public storefront shape before rendering.
export function transformImageUrls(products: unknown[]): WooProduct[] {
  if (!Array.isArray(products)) return [];

  return products.map((product) => transformProduct(product as WooRawProduct));
}

export function normalizePublicAssetUrl(src: string): string {
  try {
    const url = new URL(src);
    if (url.hostname === 'e-mart.com.bd' || url.hostname === LEGACY_IP_HOST || LOCAL_WORDPRESS_HOSTS.has(url.hostname)) {
      return `${PUBLIC_SITE_URL}${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return src;
  }

  return src;
}
