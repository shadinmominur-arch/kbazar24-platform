import Link from 'next/link';
import {
  BadgePercent,
  Boxes,
  Gift,
  MoonStar,
  Sparkles,
  Ticket,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { OFFER_COLLECTIONS } from '@/lib/offerCollectionConfig';

const offerIconMap: Record<(typeof OFFER_COLLECTIONS)[number]['icon'], LucideIcon> = {
  gift: Gift,
  moon: MoonStar,
  tag: BadgePercent,
  boxes: Boxes,
  truck: Truck,
  ticket: Ticket,
};

export default function OfferCollectionsRail() {
  return (
    <section className="bg-bg px-4 pb-6 pt-6">
      <div className="mx-auto max-w-6xl">
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max snap-x snap-mandatory gap-4 pb-2 lg:grid lg:w-full lg:grid-cols-6 lg:gap-4 lg:snap-none">
            {OFFER_COLLECTIONS.map((item) => {
              const hintMap: Record<string, string> = {
                bogo: 'Buy 1 get 1 picks',
                'eid-offer': 'Seasonal skincare deals',
                'clearance-sale': 'Extra markdowns',
                combo: 'Bundle and set offers',
                'free-delivery': 'For ৳3000+ carts',
                coupon: 'Code-ready picks',
              };
              const IconComp = offerIconMap[item.icon] ?? Sparkles;
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={`group relative flex min-h-[132px] w-[44vw] min-w-[156px] max-w-[200px] snap-start flex-col justify-between overflow-hidden rounded-[22px] border border-hairline bg-gradient-to-br ${item.accent} px-4 py-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-pop lg:min-h-[144px] lg:w-auto lg:max-w-none lg:px-5 lg:py-5`}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_45%)]" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r from-accent via-accent/60 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-white/40 blur-2xl" />
                  <div className="relative z-[1] flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent shadow-sm">
                      Offer
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-accent shadow-sm transition-transform group-hover:scale-110">
                      <IconComp className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="relative z-[1] mt-3">
                    <div className="text-base font-black leading-5 text-ink lg:text-lg">{item.label}</div>
                    <div className="mt-1.5 max-w-[14ch] text-[12px] font-semibold leading-4 text-ink/70 lg:max-w-none">
                      {hintMap[item.slug]}
                    </div>
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
