const SITE_URL = 'https://e-mart.com.bd';

interface CollectionSchemaProduct {
  name: string;
  slug: string;
}

interface BuildCollectionSchemaArgs {
  type: 'brand' | 'category' | 'origin';
  title: string;
  description: string;
  url: string;
  breadcrumbs: Array<{ name: string; url: string }>;
  products: CollectionSchemaProduct[];
  page: number;
  perPage?: number;
}

export function buildCollectionSchema({
  title,
  description,
  url,
  breadcrumbs,
  products,
  page,
  perPage = 24,
}: BuildCollectionSchemaArgs) {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description.substring(0, 200),
    url,
    breadcrumb: { '@id': `${url}#breadcrumb` },
  };

  const itemListJsonLd = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    url,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: (page - 1) * perPage + i + 1,
      name: p.name,
      url: `${SITE_URL}/shop/${p.slug}`,
    })),
  } : null;

  return { breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd };
}

export function getBrandDescription(brandName: string): string {
  return `Shop authentic ${brandName} skincare in Bangladesh at Emart. Original ${brandName} products with Cash on Delivery, fast nationwide delivery, and 100% authenticity guaranteed.`;
}
