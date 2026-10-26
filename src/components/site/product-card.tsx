import Link from 'next/link';
import { Clock3, MapPin, Users } from 'lucide-react';
import type { Product } from '@/lib/types';
import { money } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from './rating-stars';

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const rating = product.rating?.average ?? 0;
  const count = product.rating?.count ?? 0;

  return (
    <article className={className}>
      <Link href={`/products/${product.slug}`} className="group block overflow-hidden rounded-2xl border bg-card card-hover">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">No image</div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.isFeatured && <Badge className="bg-primary text-primary-foreground">Featured</Badge>}
            {product.onSale && <Badge className="bg-emerald-600 text-white">Sale</Badge>}
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> {product.type === 'tour' ? 'Guided tour' : 'Experience'}
            </span>
            {count > 0 && (
              <span className="inline-flex items-center gap-1">
                <RatingStars value={rating} />
                <span>({count})</span>
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary">
            {product.title}
          </h3>
          {product.shortDescription && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription.replace(/<[^>]*>/g, '')}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" /> Flexible
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" /> Small groups
            </span>
          </div>
          <div className="flex items-end justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              From{' '}
              <span className="block text-lg font-semibold text-foreground">
                {money(product.price, product.currency)}
              </span>
            </p>
            <span className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">View details</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
