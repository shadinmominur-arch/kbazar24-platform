export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';

export type StockProduct = {
  id: number;
  name?: string;
  type?: string;
  parent_id?: number;
  status?: string;
  purchasable?: boolean;
  stock_status?: StockStatus;
  manage_stock?: boolean;
  stock_quantity?: number | null;
  backorders?: 'no' | 'notify' | 'yes' | string;
};

export type StockAvailability = {
  available: boolean;
  reason: string;
  name: string;
  product_id: number;
  variation_id?: number;
  stock_status?: StockStatus;
  manage_stock?: boolean;
  stock_quantity?: number | null;
  backorders?: string;
};

function productName(product: StockProduct | null | undefined, fallbackId: number): string {
  const name = product?.name?.trim();
  return name || `Product #${fallbackId}`;
}

function backordersAllowed(product: StockProduct): boolean {
  return product.stock_status === 'onbackorder' || product.backorders === 'yes' || product.backorders === 'notify';
}

export function normalizeStockAvailability(
  product: StockProduct | null | undefined,
  quantity = 1,
  variation?: StockProduct | null,
): StockAvailability {
  const selected = variation || product;
  const fallbackId = Number(selected?.id || product?.id || 0);
  const requestedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const variationId = variation?.id ? Number(variation.id) : undefined;

  const base = {
    name: productName(selected, fallbackId),
    product_id: Number(product?.id || selected?.parent_id || selected?.id || 0),
    ...(variationId ? { variation_id: variationId } : {}),
    stock_status: selected?.stock_status,
    manage_stock: selected?.manage_stock,
    stock_quantity: selected?.stock_quantity ?? null,
    backorders: selected?.backorders,
  };

  if (!selected) {
    return { ...base, available: false, reason: 'missing_product' };
  }

  if (selected.status && selected.status !== 'publish') {
    return { ...base, available: false, reason: 'not_publish' };
  }

  if (selected.purchasable === false) {
    return { ...base, available: false, reason: 'not_purchasable' };
  }

  if (selected.stock_status === 'outofstock') {
    return { ...base, available: false, reason: 'stock_status_outofstock' };
  }

  if (selected.manage_stock === true) {
    if (backordersAllowed(selected)) {
      return { ...base, available: true, reason: 'managed_backorders_allowed' };
    }

    const stockQuantity = selected.stock_quantity;
    if (typeof stockQuantity === 'number' && Number.isFinite(stockQuantity) && stockQuantity >= requestedQuantity) {
      return { ...base, available: true, reason: 'managed_stock_sufficient' };
    }

    return { ...base, available: false, reason: 'managed_stock_insufficient' };
  }

  if (selected.stock_status === 'instock' || selected.stock_status === 'onbackorder') {
    return { ...base, available: true, reason: 'unmanaged_instock' };
  }

  return { ...base, available: false, reason: 'unknown_stock_state' };
}

export function isProductAvailable(product: StockProduct, quantity = 1): boolean {
  return normalizeStockAvailability(product, quantity).available;
}

export function checkoutStockErrorMessage(result: StockAvailability): string {
  return `${result.name} is currently out of stock. Please remove it from cart or contact us.`;
}
