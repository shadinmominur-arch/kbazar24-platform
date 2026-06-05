import Link from 'next/link';
import type { WooProduct } from '@/lib/woocommerce';
import { CONCERN_DEFINITIONS, getConcernHref } from '@/lib/concerns';
import { INGREDIENT_DEFINITIONS } from '@/lib/ingredients';
import { ROUTINE_STEPS } from '@/lib/routine';

interface BrandLogo {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

interface BlogPostSummary {
  id: number;
  title: string;
  excerpt: string;
  href: string;
  date: string;
}

function LinkList({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h2 className="text-xs font-extrabold uppercase tracking-[0.22em] text-accent">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm font-semibold leading-5 text-ink/75 hover:text-accent hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomepageSeoLinkHub({
  bestSellers,
  newArrivals,
  brandLogos,
  blogPosts,
}: {
  bestSellers: WooProduct[];
  newArrivals: WooProduct[];
  brandLogos: BrandLogo[];
  blogPosts: BlogPostSummary[];
}) {
  const productLinks = [...bestSellers.slice(0, 3), ...newArrivals.slice(0, 3)]
    .filter((product, index, all) => all.findIndex((item) => item.slug === product.slug) === index)
    .slice(0, 6)
    .map((product) => ({ href: `/shop/${product.slug}`, label: product.name }));

  const concernLinks = CONCERN_DEFINITIONS.slice(0, 6).map((item) => ({
    href: getConcernHref(item.slug),
    label: item.label,
  }));

  const ingredientLinks = INGREDIENT_DEFINITIONS.slice(0, 6).map((item) => ({
    href: `/ingredients/${item.slug}`,
    label: item.label,
  }));

  const routineLinks = ROUTINE_STEPS.slice(0, 4).map((item) => ({
    href: `/routine/${item.slug}`,
    label: item.shortLabel,
  }));

  const brandLinks = brandLogos.slice(0, 6).map((brand) => ({
    href: `/brands/${encodeURIComponent(brand.slug)}`,
    label: brand.name,
  }));

  const blogLinks = blogPosts.slice(0, 3).map((post) => ({
    href: post.href,
    label: post.title,
  }));

  return (
    <section className="bg-white px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Explore Emart</p>
          <h2 className="mt-2 text-xl font-extrabold text-ink lg:text-2xl">Popular skincare paths</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productLinks.length ? <LinkList title="Popular products" links={productLinks} /> : null}
          <LinkList title="Skin concerns" links={concernLinks} />
          <LinkList title="Ingredients" links={ingredientLinks} />
          <LinkList title="Routine steps" links={routineLinks} />
          {brandLinks.length ? <LinkList title="Brands" links={brandLinks} /> : null}
          {blogLinks.length ? <LinkList title="Latest guides" links={blogLinks} /> : null}
        </div>
      </div>
    </section>
  );
}
