export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type?: string;
  parent_id?: number;
  status?: string;
  date_created?: string;
  date_modified?: string;
  sku?: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  manage_stock?: boolean;
  stock_quantity: number | null;
  backorders?: 'no' | 'notify' | 'yes' | string;
  description: string;
  short_description: string;
  images: WooImage[];
  categories: WooCategory[];
  brands?: WooProductBrand[];
  attributes: WooAttribute[];
  meta_data?: WooMetaData[];
  average_rating: string;
  rating_count: number;
  featured: boolean;
  emart_version?: 'us' | 'uk' | 'eu' | 'fr';
  concern_terms?: { name: string; slug: string }[];
}

export interface WooImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  image?: WooImage;
  count?: number;
}

export interface WooProductBrand {
  id: number;
  name: string;
  slug: string;
}

export interface WooAttribute {
  id: number;
  name: string;
  options: string[];
}

export interface WooMetaData {
  id?: number;
  key: string;
  value: unknown;
}

export interface WooBrand {
  id: number;
  name: string;
  slug: string;
  count: number;
  link?: string;
}

export interface WooOrder {
  id: number;
  customer_id?: number;
  status: string;
  total: string;
  currency?: string;
  payment_method?: string;
  payment_method_title?: string;
  line_items: WooLineItem[];
  shipping: WooShipping;
  billing: WooBilling;
  date_created: string;
  date_modified?: string;
  meta_data?: WooMetaData[];
}

export interface WooOrderNote {
  id: number;
  author: string;
  date_created: string;
  note: string;
  customer_note?: boolean;
}

export interface WooLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id?: number;
  quantity: number;
  total: string;
  image?: WooImage;
}

export interface WooShipping {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
}

export interface WooBilling extends WooShipping {
  email: string;
}

export interface WooCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string;
  meta_data?: WooMetaData[];
}

export interface WooProductReview {
  id: number;
  product_id: number;
  reviewer: string;
  reviewer_email?: string;
  review: string;
  rating: number;
  date_created: string;
  verified: boolean;
  status?: string;
}

export interface WooCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: string;
  date_expires?: string | null;
  minimum_amount?: string;
  maximum_amount?: string;
}

export interface WooShippingQuote {
  city: string;
  zoneName: string;
  methodId: string;
  methodTitle: string;
  total: number;
  isFree: boolean;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number | null;
}

export interface ProductsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  category_operator?: 'in' | 'and' | 'not_in';
  tag?: string;
  include?: string;
  attribute?: string;
  attribute_term?: string;
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title' | 'include';
  order?: 'asc' | 'desc';
  on_sale?: boolean;
  featured?: boolean;
  min_price?: string;
  max_price?: string;
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  exclude?: string;
  status?: string;
  after?: string;
  before?: string;
}

export type WooRawImage = Partial<{
  id: number | string;
  src: string;
  name: unknown;
  alt: unknown;
}>;

export type WooRawCategory = Partial<{
  id: number | string;
  name: unknown;
  slug: string;
  image: WooRawImage;
  count: number;
}>;

export type WooRawProductBrand = Partial<{
  id: number | string;
  name: unknown;
  slug: string;
}>;

export type WooRawAttribute = Partial<{
  id: number | string;
  name: unknown;
  options: unknown[];
}>;

export type WooRawMetaData = Partial<{
  id: number;
  key: string;
  value: unknown;
}>;

export type WooRawProduct = Partial<{
  id: number | string;
  name: unknown;
  slug: string;
  permalink: string;
  type: string;
  parent_id: number | string;
  status: string;
  date_created: string;
  date_modified: string;
  sku: unknown;
  price: string | number;
  regular_price: string | number;
  sale_price: string | number;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: WooProduct['stock_status'];
  manage_stock: boolean;
  stock_quantity: number | null;
  backorders: string;
  description: unknown;
  short_description: unknown;
  images: WooRawImage[];
  categories: WooRawCategory[];
  brands: WooRawProductBrand[];
  attributes: WooRawAttribute[];
  meta_data: WooRawMetaData[];
  average_rating: string | number;
  rating_count: number | string;
  featured: boolean;
  emart_version: WooProduct['emart_version'];
  concern_terms: Array<{ name?: unknown; slug?: unknown }>;
}>;

export type WooRawProductReview = Partial<{
  id: number | string;
  product_id: number | string;
  product: number | string;
  reviewer: unknown;
  reviewer_email: string;
  review: unknown;
  rating: number | string;
  date_created: string;
  verified: boolean;
  status: string;
}>;

export type WooRawCoupon = Partial<{
  id: number | string;
  code: string;
  amount: string | number;
  discount_type: string;
  date_expires: string | null;
  minimum_amount: string | number;
  maximum_amount: string | number;
}>;

export type WooRawTerm = Partial<{
  id: number | string;
  name: unknown;
  slug: string;
  count: number | string;
  link: string;
}>;

export type WooRawIdOnly = Partial<{ id: number | string }>;

export type WooRawShippingMethod = Partial<{
  settings: Record<string, { value?: unknown }>;
  cost: string | number;
  min_amount: string | number;
  enabled: boolean | string;
  method_id: string;
  id: string | number;
  title: string;
}>;

export type WooRawShippingZone = Partial<{
  id: number | string;
  name: string;
}>;
