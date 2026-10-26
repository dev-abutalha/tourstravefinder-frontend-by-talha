import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money } from '@/lib/api';
import type { PromoPublic } from '@/lib/types';

export function PromoBanner({ promo }: { promo?: PromoPublic | null }) {
  if (!promo?.showBanner) return null;
  const products = (promo.products ?? []).slice(0, 4);

  return (
    <section className="container-page py-14 sm:py-16">
      <div className="relative isolate overflow-hidden rounded-3xl bg-navy text-white">
        {promo.bgImage && <img src={promo.bgImage} alt="" className="absolute inset-0 -z-20 size-full object-cover opacity-30" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-navy/30" />
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:items-center">
          <div>
            {promo.title && <h2 className="text-3xl font-semibold text-balance sm:text-4xl">{promo.title}</h2>}
            {promo.offerText && <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">{promo.offerText}</p>}
            {promo.buttonText && promo.buttonLink && (
              <Button asChild size="lg" className="mt-6 rounded-full">
                <Link href={promo.buttonLink}>
                  {promo.buttonText} <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            )}
          </div>

          {products.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur transition-colors hover:bg-white/15"
                >
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-white/10">
                    {product.image && (
                      <img
                        src={product.image}
                        alt=""
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{product.title}</p>
                    <p className="mt-1 text-xs text-amber-300">
                      From {money(product.salePrice ?? product.price, product.currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
