import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, User } from 'lucide-react';
import { serverGetSafe } from '@/lib/api';
import type { PostDoc, Product } from '@/lib/types';
import { ProductCarousel } from '@/components/site/product-carousel';

interface PostPayload extends PostDoc {
  related?: PostDoc[];
  relatedProducts?: Product[];
  authorName?: string;
  readingMinutes?: number;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await serverGetSafe<PostPayload | null>(`/posts/${slug}`, null, 120);
  if (!post) return { title: 'Story not found' };
  return { title: post.title, description: post.excerpt, openGraph: post.image ? { images: [post.image] } : undefined };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await serverGetSafe<PostPayload | null>(`/posts/${slug}`, null, 120);
  if (!post) notFound();

  const related = post.related ?? [];
  const relatedProducts = post.relatedProducts ?? [];

  return (
    <>
      <div className="relative isolate overflow-hidden">
        {post.image ? (
          <img src={post.image} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 -z-20 bg-navy" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
        <div className="container-page py-20 text-white sm:py-28">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white">
            <ArrowLeft className="size-3.5" /> Back to travel blog
          </Link>
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold text-balance sm:text-4xl lg:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" /> {post.authorName || 'Travel team'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Recent'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5" /> {post.readingMinutes || 5} min read
            </span>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <div className="prose-rich max-w-none text-base" dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || '' }} />
        </article>

        <aside className="space-y-8">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide">About the author</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Written by the {post.authorName || 'Tours & Travel'} team, sharing local knowledge and practical advice from the road.
            </p>
          </div>
          <div className="rounded-2xl bg-navy p-5 text-white">
            <p className="text-sm font-semibold">Ready to go?</p>
            <p className="mt-2 text-sm text-white/70">Browse hand-picked tours and tickets for your next trip.</p>
            <Link href="/products" className="mt-4 inline-flex text-sm font-medium text-amber-300 hover:underline">
              Explore experiences
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-page pb-12">
          <h2 className="text-xl font-semibold">More travel stories</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <Link key={item.id} href={`/blog/${item.slug}`} className="group overflow-hidden rounded-2xl border bg-card card-hover">
                <div className="aspect-[16/10] bg-muted">
                  {item.image && <img src={item.image} alt={item.title} className="size-full object-cover" loading="lazy" />}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="bg-muted/40 py-14">
          <div className="container-page">
            <h2 className="text-xl font-semibold">Experiences mentioned in this story</h2>
            <div className="mt-6">
              <ProductCarousel products={relatedProducts} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
