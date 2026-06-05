import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Clock3, Droplets, Headphones, ShieldCheck, Sparkles, Star, Sun, Target, Truck, WalletCards, type LucideIcon } from 'lucide-react';
import type { WooProduct } from '@/lib/woocommerce';
import { CONCERN_DEFINITIONS, getConcernHref } from '@/lib/concerns';
import { INGREDIENT_DEFINITIONS } from '@/lib/ingredients';
import { ROUTINE_STEPS } from '@/lib/routine';
import { STORE_POLICIES } from '@/config/storePolicies';
import { formatBDT } from '@/lib/formatters';

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

const concernIconMap: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  target: Target,
  droplets: Droplets,
  'clock-3': Clock3,
  sun: Sun,
  star: Star,
  'shield-check': ShieldCheck,
};

function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function ProductRail({
  title,
  eyebrow,
  products,
  badge,
  href,
}: {
  title: string;
  eyebrow: string;
  products: WooProduct[];
  badge: string;
  href: string;
}) {
  if (!products.length) return null;

  return (
    <section className="bg-bg px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink lg:text-3xl">{title}</h2>
          </div>
          <Link href={href} className="hidden text-sm font-bold text-accent lg:inline-flex">
            View All <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex w-max gap-4 lg:grid lg:w-auto lg:grid-cols-4">
            {products.slice(0, 4).map((product) => {
              const image = product.images?.[0];
              const price = product.sale_price || product.price || product.regular_price;
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group block w-[46vw] min-w-[172px] max-w-[220px] overflow-hidden rounded-lg border border-hairline bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-pop lg:w-auto lg:min-w-0 lg:max-w-none"
                >
                  <div className="relative aspect-square bg-gray-50">
                    {image?.src ? (
                      <Image
                        src={image.src}
                        alt={image.alt || product.name}
                        fill
                        sizes="(max-width: 640px) 172px, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted">Emart</div>
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[11px] font-bold text-accent shadow-sm">
                      {badge}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 text-ink">{product.name}</p>
                    {price ? <p className="mt-2 text-base font-extrabold text-accent">{formatBDT(price)}</p> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConcernTilesSection() {
  return (
    <section className="bg-bg px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Your skin concern</p>
          <h2 className="mt-2 text-2xl font-extrabold text-ink lg:text-3xl">Shop by concern</h2>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex w-max snap-x snap-mandatory gap-3 pb-1 sm:grid sm:w-auto sm:grid-cols-2 sm:snap-none sm:pb-0 lg:grid-cols-3">
            {CONCERN_DEFINITIONS.map((item) => {
              const Icon = concernIconMap[item.icon] || Sparkles;
              return (
                <Link
                  key={item.slug}
                  href={getConcernHref(item.slug)}
                  className="flex min-h-[64px] w-[76vw] max-w-[280px] shrink-0 snap-start items-center gap-3 rounded-[22px] border border-hairline bg-bg-alt px-4 py-3 transition-all hover:border-accent/30 hover:bg-white hover:shadow-card sm:w-auto sm:max-w-none sm:shrink sm:rounded-lg sm:px-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-ink">{item.label}</div>
                    <div className="truncate text-xs font-medium text-gray-500">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function GuideLinksSection() {
  const guideTiles = [
    { emoji: '💧', label: 'Oily Skin Guide', sublabel: "Routine for Dhaka's humidity", href: '/skin-type/oily', color: 'bg-blue-50 text-blue-700' },
    { emoji: '🔬', label: 'Acne-Prone Guide', sublabel: 'Science-backed Bangladesh advice', href: '/skin-type/acne-prone', color: 'bg-rose-50 text-rose-700' },
    { emoji: '☀️', label: 'Best Sunscreens', sublabel: 'No white cast, PA++++', href: '/best/sunscreen-oily-skin-bangladesh', color: 'bg-amber-50 text-amber-700' },
    { emoji: '⚖️', label: 'CeraVe vs COSRX', sublabel: 'Which cleanser wins?', href: '/compare/cerave-vs-cosrx-cleanser', color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <section className="bg-bg px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Emart Guides</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink lg:text-3xl">Best picks & skin guides</h2>
          </div>
          <Link href="/best" className="hidden text-sm font-semibold text-accent hover:underline sm:block">
            All guides →
          </Link>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex w-max snap-x snap-mandatory gap-3 pb-1 sm:grid sm:w-auto sm:grid-cols-2 sm:snap-none sm:pb-0 lg:grid-cols-4">
            {guideTiles.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className="flex min-h-[64px] w-[72vw] max-w-[260px] shrink-0 snap-start items-center gap-3 rounded-[22px] border border-hairline bg-bg-alt px-4 py-3 transition-all hover:border-accent/30 hover:bg-white hover:shadow-card sm:w-auto sm:max-w-none sm:shrink sm:rounded-lg sm:px-3"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${tile.color}`}>{tile.emoji}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-ink">{tile.label}</div>
                  <div className="truncate text-xs font-medium text-gray-500">{tile.sublabel}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IngredientRoutineLinks() {
  return (
    <>
      <section className="bg-bg-alt px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Shop by active</p>
              <h2 className="mt-2 text-2xl font-extrabold text-ink lg:text-3xl">Star Ingredients</h2>
            </div>
            <Link href="/ingredients" className="shrink-0 text-xs font-semibold text-accent hover:underline">
              All ingredients →
            </Link>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="flex w-max gap-3 pb-1 sm:grid sm:w-auto sm:grid-cols-4 sm:pb-0 lg:grid-cols-8">
              {INGREDIENT_DEFINITIONS.slice(0, 8).map((ing) => (
                <Link key={ing.slug} href={`/ingredients/${ing.slug}`} className="flex w-[120px] shrink-0 flex-col items-center gap-2 rounded-xl border border-hairline bg-white p-3 text-center transition-all hover:border-accent/30 hover:shadow-card sm:w-auto sm:shrink">
                  <span className="text-xl sm:text-2xl">{ing.icon}</span>
                  <span className="text-xs font-semibold text-ink">{ing.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-success-DEFAULT" style={{ color: '#2E7D5B' }}>Step-by-step</p>
              <h2 className="mt-2 text-2xl font-extrabold text-ink lg:text-3xl">Build Your Routine</h2>
            </div>
            <Link href="/routine" className="shrink-0 text-xs font-semibold text-accent hover:underline">
              Full guide →
            </Link>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="flex w-max gap-3 pb-1 sm:grid sm:w-auto sm:grid-cols-3 sm:pb-0 lg:grid-cols-6">
              {ROUTINE_STEPS.slice(0, 6).map((step) => (
                <Link key={step.slug} href={`/routine/${step.slug}`} className="flex w-[140px] shrink-0 flex-col gap-2 rounded-xl border border-hairline bg-white p-3 transition-all hover:border-accent/30 hover:shadow-card sm:w-auto sm:shrink sm:p-4">
                  <span className="text-xl sm:text-2xl">{step.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Step {step.step}</span>
                  <span className="text-xs font-bold leading-tight text-ink">{step.shortLabel}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BrandLogoGridSection({ brands }: { brands: BrandLogo[] }) {
  const visible = brands.slice(0, 16);

  return (
    <section className="bg-bg-alt px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">400+ brands, hand-verified</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink lg:text-3xl">Shop by brand</h2>
          </div>
          <Link href="/brands" className="hidden text-sm font-bold text-accent lg:inline-flex">
            See all brands →
          </Link>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
          <div className="flex w-max snap-x snap-mandatory gap-2.5 pb-1">
            {visible.filter((b) => b.logo).slice(0, 10).map((brand) => (
              <Link key={brand.id} href={`/brands/${encodeURIComponent(brand.slug)}`} title={brand.name} className="flex h-24 w-[32vw] min-w-[110px] snap-start items-center justify-center rounded-2xl border border-hairline bg-white p-2 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30">
                <div className="relative h-full w-full">
                  <Image src={brand.logo} alt={brand.name} fill sizes="120px" className="object-contain" />
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid lg:grid-cols-8">
          {visible.filter((b) => b.logo).map((brand) => (
            <Link key={brand.id} href={`/brands/${encodeURIComponent(brand.slug)}`} title={brand.name} className="flex h-24 items-center justify-center rounded-lg border border-hairline bg-white p-2 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30">
              <div className="relative h-full w-full">
                <Image src={brand.logo} alt={brand.name} fill sizes="160px" className="object-contain" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthenticityOriginSection() {
  return (
    <>
      <section className="bg-bg-alt px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Why Bangladeshi customers stay with us</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink lg:text-3xl">Why ৫০,০০০+ Bangladeshi trust us</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['400+', 'brands hand-verified'],
              ['50,000+', 'orders delivered'],
              ['64', 'districts reached'],
              ['4.9', 'avg review'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-hairline bg-white px-4 py-5 text-center shadow-card">
                <div className="text-3xl font-extrabold text-accent">{value}</div>
                <div className="mt-2 text-sm font-semibold text-ink">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-5 overflow-hidden rounded-lg border border-hairline bg-bg-alt lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[260px]">
            <Image src="/images/store-interior.webp" alt="Emart skincare store in Dhanmondi" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center" />
          </div>
          <div className="p-6 lg:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">A shop that began in Dhanmondi</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink lg:text-3xl">Origin story</h2>
            <p className="mt-4 text-sm leading-7 text-gray-600">
              We started with one practical idea: make authentic global beauty easier to buy in Bangladesh without guesswork,
              fake-product anxiety, or confusing pricing.
            </p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              The shop grew from Dhanmondi to a nationwide customer base, but the standard stayed the same: verify first, sell second.
            </p>
            <Link href="/our-story" className="mt-5 inline-flex text-sm font-bold text-accent">
              Our story →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function BlogTeaserSection({ posts }: { posts: BlogPostSummary[] }) {
  const visible = posts.slice(0, 3);
  if (!visible.length) return null;

  return (
    <section className="bg-bg px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Skincare journal · জার্নাল</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink lg:text-3xl">Editorial</h2>
          </div>
          <Link href="/blog" className="text-sm font-bold text-accent hover:underline">
            Read all articles →
          </Link>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 [contain:layout] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:overflow-visible md:px-0">
          <div className="flex w-max snap-x snap-mandatory gap-4 pb-1 md:grid md:w-auto md:grid-cols-3 md:snap-none md:pb-0">
            {visible.map((post) => (
              <article key={post.id} className="w-[78vw] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none md:shrink">
                <Link href={post.href} className="block rounded-[22px] border border-hairline bg-bg-alt p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30 md:rounded-lg">
                  <time dateTime={post.date} className="text-xs font-bold uppercase tracking-wide text-accent">{formatBlogDate(post.date)}</time>
                  <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-ink">{post.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-gray-600">{post.excerpt}</p>
                  <span className="mt-4 inline-block text-xs font-bold text-accent">Read article<span className="sr-only"> about {post.title}</span> →</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, label: '100% Authentic' },
    { icon: Truck, label: 'Fast Bangladesh Delivery' },
    { icon: WalletCards, label: `Free delivery over ৳${STORE_POLICIES.shipping.freeShippingThreshold.toLocaleString('en-BD')}` },
    { icon: Headphones, label: 'Easy Support' },
  ];

  return (
    <section data-nosnippet className="border-y border-[var(--color-border-soft)] bg-[var(--color-surface-soft)] px-4 py-4">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex min-h-[64px] items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] px-3 py-3 shadow-[var(--shadow-soft)]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
              <Icon size={18} strokeWidth={2.25} />
            </span>
            <span className="text-[13px] font-bold leading-snug text-[var(--color-brand-dark)] sm:text-sm">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomepageSeoSections({
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
  return (
    <>
      <ProductRail title="Best sellers" eyebrow="Customer favourites" products={bestSellers} badge="Best Seller" href="/shop?sort=popularity" />
      <ProductRail title="New arrivals" eyebrow="Just in this week" products={newArrivals} badge="New" href="/new-arrivals" />
      <ConcernTilesSection />
      <GuideLinksSection />
      <IngredientRoutineLinks />
      <AuthenticityOriginSection />
      <BrandLogoGridSection brands={brandLogos} />
      <BlogTeaserSection posts={blogPosts} />
      <TrustStrip />
    </>
  );
}
