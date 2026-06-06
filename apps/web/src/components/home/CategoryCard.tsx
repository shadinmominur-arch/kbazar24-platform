'use client';

import Link from 'next/link';
import { CategoryIllustration } from '@/components/category/CategoryIllustration';
import type { FeaturedCategory } from '@/lib/api/featured-categories';

export function CategoryCard({ category, index }: { category: FeaturedCategory; index: number }) {

  const badge =
    category.is_hot  ? { label: 'HOT',  cls: 'bg-[rgba(217,83,79,0.10)] text-[#D9534F]', icon: '🔥' } :
    category.has_new ? { label: 'NEW',  cls: 'bg-[rgba(212,162,72,0.15)] text-[#8C6914]', icon: null } :
    category.has_sale? { label: 'SALE', cls: 'bg-[var(--mb-pink-bg)] text-[#B33D6E]',     icon: null } :
    null;

  return (
    <Link
      href={category.href || `/category/${category.slug}`}
      className="group flex flex-col rounded-[var(--mb-radius)] border border-[var(--mb-line)] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(27,27,47,.08),0_1px_3px_rgba(27,27,47,.05)]"
    >
      {/* Image */}
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-[var(--mb-cream)]">
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
          <CategoryIllustration slug={category.slug} uid={category.id || index} />
        </div>

        {/* Badge — HOT / NEW / SALE */}
        {badge && (
          <span className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${badge.cls}`}>
            {badge.icon}{badge.label}
          </span>
        )}
      </div>

      {/* Text */}
      <p className="mt-0.5 text-[14px] font-medium leading-snug text-[var(--mb-navy)]">{category.name}</p>
      <p className="mt-1 text-[11px] text-[var(--mb-ink-3)]">
        {category.product_count.toLocaleString()} products
      </p>
    </Link>
  );
}
