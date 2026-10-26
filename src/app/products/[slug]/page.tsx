import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Globe2,
  Info,
  MapPin,
  ShieldCheck,
  Star,
  Ticket,
  Users,
} from 'lucide-react';
import { money, serverGetEnvelope, serverGetSafe } from '@/lib/api';
import type { ProductFull, ReviewItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Gallery } from '@/components/site/gallery';
import { BookingWidget } from '@/components/site/booking-widget';
import { ProductCarousel } from '@/components/site/product-carousel';
import { RatingStars } from '@/components/site/rating-stars';
import { SectionHeading } from '@/components/site/section-heading';

interface ReviewsEnvelope {
  success: boolean;
  data: ReviewItem[];
  summary: { total: number; rated: number; average: number; counts: Record<string, number> };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await serverGetSafe<ProductFull | null>(`/products/${slug}`, null, 120);
  if (!product) return { title: 'Experience not found' };
  return {
    title: product.title,
    description: product.shortDescription?.replace(/<[^>]*>/g, '') ?? undefined,
    openGraph: product.image ? { images: [product.image] } : undefined,
  };
}

function prettifyKey(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .replace(/_/g, ' ');
}

function plain(value: unknown): string {
  if (typeof value === 'string') return value.replace(/<[^>]*>/g, '').trim();
  if (value && typeof value === 'object') return '';
  return value == null ? '' : String(value);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await serverGetSafe<ProductFull | null>(`/products/${slug}`, null, 120);
  if (!product) notFound();

  const reviews: ReviewsEnvelope = await serverGetEnvelope<ReviewItem[]>(`/products/${product.id}/reviews?limit=6`, 30)
    .then((envelope) => envelope as unknown as ReviewsEnvelope)
    .catch(() => ({ success: true, data: [], summary: { total: 0, rated: 0, average: 0, counts: {} } }) as ReviewsEnvelope);

  const images = [
    ...(product.images ?? []),
    ...(product.gallery ?? []).map((url) => ({ url, alt: product.title })),
  ].filter((image) => image.url);

  const keyPoints = Object.entries(product.keyPoints ?? {}).filter(([, value]) => plain(value));
  const important = product.importantInformation as { title?: string; content?: string } | undefined;
  const guide = product.liveTourGuide as { title?: string; content?: string } | undefined;
  const rating = reviews.summary.average || product.rating?.average || 0;
  const reviewCount = reviews.summary.total || product.rating?.count || 0;
  const highlights = Array.isArray(product.keyPoints?.highlights) ? product.keyPoints.highlights : [];

  return (
    <>
      <div className="border-b bg-muted/30">
        <div className="container-page flex flex-wrap items-center gap-1.5 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">Tours & tickets</Link>
          <span>/</span>
          <span className="line-clamp-1 text-foreground">{product.title}</span>
        </div>
      </div>

      <div className="container-page py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  <MapPin className="mr-1 size-3" /> {product.type === 'tour' ? 'Guided tour' : 'Experience'}
                </Badge>
                {product.isFeatured && <Badge className="rounded-full bg-primary">Traveller favourite</Badge>}
              </div>
              <h1 className="mt-3 text-2xl font-semibold leading-tight text-balance sm:text-3xl lg:text-4xl">{product.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <RatingStars value={rating} />
                  <span className="font-medium text-foreground">{rating ? rating.toFixed(1) : 'New'}</span>
                  <span>({reviewCount} reviews)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="size-4 text-emerald-600" /> Verified experiences
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4" /> {plain(product.keyPoints?.duration) || 'Flexible duration'}
                </span>
              </div>
            </div>

            <Gallery images={images} title={product.title} />

            {product.shortDescription && (
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {product.shortDescription.replace(/<[^>]*>/g, '')}
              </p>
            )}

            <div className="mt-8 rounded-2xl border bg-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Why travellers love it</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(highlights.length ? highlights : [
                  'Instant confirmation and mobile tickets',
                  'Expert local guides and small groups',
                  'Secure payment and 24/7 support',
                  'Flexible cancellation on selected options',
                ]).map((highlight) => (
                  <p key={String(highlight)} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {plain(highlight)}
                  </p>
                ))}
              </div>
            </div>

            {product.description && (
              <section className="mt-10">
                <h2 className="text-xl font-semibold">About this experience</h2>
                <div className="prose-rich mt-4" dangerouslySetInnerHTML={{ __html: product.description }} />
              </section>
            )}

            {keyPoints.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-semibold">Good to know</h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {keyPoints.map(([key, value]) => (
                    <div key={key} className="rounded-xl border bg-card px-4 py-3">
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{prettifyKey(key)}</dt>
                      <dd className="mt-1 text-sm font-medium">{plain(value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {product.productOptions?.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-semibold">Options & pricing</h2>
                <div className="mt-4 space-y-3">
                  {product.productOptions.map((option) => (
                    <div key={option.index} className="rounded-xl border bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-muted-foreground">
                          From {money(Math.min(...option.prices.map((price) => price.computedPrice)), product.currency)}
                        </p>
                      </div>
                      {option.details && <p className="mt-1 text-sm text-muted-foreground">{option.details}</p>}
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                        {option.duration && (
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="size-3.5" /> {option.duration}
                          </span>
                        )}
                        {option.languages.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Globe2 className="size-3.5" /> {option.languages.join(', ')}
                          </span>
                        )}
                        {option.capacity ? (
                          <span className="inline-flex items-center gap-1">
                            <Users className="size-3.5" /> Up to {option.capacity} people
                          </span>
                        ) : null}
                        {option.lastDays?.days > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <Ticket className="size-3.5" /> Last-minute fee within {option.lastDays.days} days
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(important?.content || guide?.content) && (
              <section className="mt-10 grid gap-4 sm:grid-cols-2">
                {important?.content && (
                  <div className="rounded-2xl border bg-card p-5">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Info className="size-4 text-primary" /> {important.title || 'Important information'}
                    </h3>
                    <div className="prose-rich mt-3 text-sm" dangerouslySetInnerHTML={{ __html: important.content }} />
                  </div>
                )}
                {guide?.content && (
                  <div className="rounded-2xl border bg-card p-5">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Globe2 className="size-4 text-primary" /> {guide.title || 'Live tour guide'}
                    </h3>
                    <div className="prose-rich mt-3 text-sm" dangerouslySetInnerHTML={{ __html: guide.content }} />
                  </div>
                )}
              </section>
            )}

            <section className="mt-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Traveller reviews</h2>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-3xl font-semibold">{rating ? rating.toFixed(1) : '—'}</p>
                    <div>
                      <RatingStars value={rating} size={16} />
                      <p className="text-xs text-muted-foreground">{reviewCount} verified reviews</p>
                    </div>
                  </div>
                </div>
                <div className="w-full max-w-xs space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.summary.counts?.[String(star)] ?? 0;
                    const pct = reviews.summary.total ? (count / reviews.summary.total) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-muted-foreground">{star}★</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {reviews.data.length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience.</p>
                )}
                {reviews.data.map((review) => (
                  <article key={review.id} className="rounded-2xl border bg-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{review.authorName}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <RatingStars value={review.rating} size={12} />
                          {review.verifiedBooking && (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <BadgeCheck className="size-3.5" /> Verified booking
                            </span>
                          )}
                        </div>
                      </div>
                      {review.createdAt && (
                        <time className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</time>
                      )}
                    </div>
                    {review.title && <p className="mt-3 font-medium">{review.title}</p>}
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.content}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <BookingWidget product={product} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
              <div className="rounded-xl border bg-card p-3">
                <ShieldCheck className="mx-auto mb-1 size-4 text-emerald-600" /> Secure
              </div>
              <div className="rounded-xl border bg-card p-3">
                <Clock3 className="mx-auto mb-1 size-4 text-emerald-600" /> Instant
              </div>
              <div className="rounded-xl border bg-card p-3">
                <Star className="mx-auto mb-1 size-4 text-amber-500" /> Top rated
              </div>
            </div>
          </aside>
        </div>
      </div>

      {product.related?.length > 0 && (
        <section className="bg-muted/40 py-14">
          <div className="container-page">
            <SectionHeading eyebrow="You may also like" title="More experiences to explore" href="/products" linkLabel="Browse all" />
            <div className="mt-8">
              <ProductCarousel products={product.related} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
