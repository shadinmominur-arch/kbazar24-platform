export type OfferCollectionSlug =
  | 'bogo'
  | 'eid-offer'
  | 'clearance-sale'
  | 'combo'
  | 'free-delivery'
  | 'coupon';

export interface OfferCollectionConfig {
  slug: OfferCollectionSlug;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  href: string;
  hint: string;
  icon: 'gift' | 'moon' | 'tag' | 'boxes' | 'truck' | 'ticket';
  accent: string;
}

export const OFFER_COLLECTIONS: OfferCollectionConfig[] = [
  {
    slug: 'bogo',
    label: 'BoGo',
    eyebrow: 'Buy more, save more',
    title: 'Buy One, Get One Picks',
    description: 'Buy one get one deals and bundle-style skincare sets from top Korean and global beauty brands, available with COD across Bangladesh.',
    seoTitle: 'Buy One Get One Skincare Deals in Bangladesh | Emart',
    seoDescription: 'Shop BOGO and bundle skincare deals at Emart Skincare Bangladesh. Authentic Korean, Japanese and global beauty sets with COD and fast delivery nationwide.',
    href: '/offers/bogo',
    hint: 'BOGO and combo-ready buys',
    icon: 'gift',
    accent: 'from-[#fff2f5] via-[#fff8fb] to-[#f9f1ff]',
  },
  {
    slug: 'eid-offer',
    label: 'Eid Offer',
    eyebrow: 'Seasonal deals',
    title: 'Eid Offer Picks',
    description: 'Seasonal sale-ready beauty picks curated from popular, featured, and promotional products.',
    seoTitle: 'Eid Skincare Offers in Bangladesh | Emart',
    seoDescription: 'Eid skincare offers at Emart Skincare Bangladesh. Authentic Korean and global beauty picks curated for the season, with COD and fast delivery nationwide.',
    href: '/offers/eid-offer',
    hint: 'Seasonal sale-ready curation',
    icon: 'moon',
    accent: 'from-[#f5f0ff] via-[#faf7ff] to-[#f4ecff]',
  },
  {
    slug: 'clearance-sale',
    label: 'Clearance Sale',
    eyebrow: 'Best markdowns',
    title: 'Clearance Sale',
    description: 'Deeper discount products sorted toward the strongest markdowns first.',
    seoTitle: 'Clearance Sale Skincare Deals in Bangladesh | Emart',
    seoDescription: 'Shop clearance sale skincare deals in Bangladesh at Emart. Find authentic Korean, Japanese and global beauty products with stronger markdowns, COD and fast delivery.',
    href: '/offers/clearance-sale',
    hint: 'Sorted by deeper discounts',
    icon: 'tag',
    accent: 'from-[#fff4eb] via-[#fff8f1] to-[#fff1e6]',
  },
  {
    slug: 'combo',
    label: 'Combo',
    eyebrow: 'Better together',
    title: 'Combo Offers',
    description: 'Bundle and combo products collected into one place for easier browsing.',
    seoTitle: 'Skincare Combo Offers in Bangladesh | Emart',
    seoDescription: 'Shop skincare combo and bundle offers at Emart Skincare Bangladesh. Multi-product sets from Korean and global beauty brands, with COD and fast delivery.',
    href: '/offers/combo',
    hint: 'Bundle and multi-item sets',
    icon: 'boxes',
    accent: 'from-[#eef7ff] via-[#f6fbff] to-[#edf5ff]',
  },
  {
    slug: 'free-delivery',
    label: 'Delivery Value',
    eyebrow: 'Higher-value carts',
    title: 'Delivery Value Products',
    description: 'Shop authentic skincare products and combo offers priced ৳3,000+ at Emart Skincare Bangladesh, curated for higher-value skincare carts.',
    href: '/offers/free-delivery',
    hint: 'Products priced ৳3,000+',
    icon: 'truck',
    accent: 'from-[#eefaf3] via-[#f8fdf9] to-[#edf8f4]',
  },
  {
    slug: 'coupon',
    label: 'Coupon',
    eyebrow: 'Code-ready deals',
    title: 'Coupon-Ready Picks',
    description: 'Coupon-eligible skincare picks from top brands at Emart Skincare Bangladesh. Apply discount codes at checkout for extra savings on authentic beauty products.',
    seoTitle: 'Coupon Deals on Skincare in Bangladesh | Emart',
    seoDescription: 'Use coupon codes on authentic Korean and global skincare at Emart Skincare Bangladesh. Discount-eligible beauty picks with COD and fast delivery nationwide.',
    href: '/offers/coupon',
    hint: 'Apply coupon codes at checkout',
    icon: 'ticket',
    accent: 'from-[#fff8e8] via-[#fffdf5] to-[#fff4d6]',
  },
];
