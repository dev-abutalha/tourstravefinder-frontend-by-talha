import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react';
import { serverGetEnvelope, serverGetSafe } from '@/lib/api';
import type { BlogCategory, Envelope, PostDoc } from '@/lib/types';
import { PageHero } from '@/components/site/page-hero';
import { Pagination } from '@/components/site/pagination';
import { EmptyState } from '@/components/site/empty-state';

export const metadata = {
  title: 'Travel blog',
  description: 'Destination guides, travel tips and inspiration from our team of explorers.',
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const search = sp.search ?? '';
  const category = sp.category ?? '';
  const categories = await serverGetSafe<BlogCategory[]>('/blog-categories', [], 300);
  const activeCategory = categories.find((item) => item.id === category || item.slug === category);
  const params = new URLSearchParams({ page: String(page), limit: '9' });
  if (search) params.set('search', search);
  if (activeCategory) params.set('category', activeCategory.id);

  const envelope = await serverGetEnvelope<PostDoc[]>(`/posts?${params.toString()}`, 60).catch(
    () => ({ success: false, data: [], meta: { total: 0, page, limit: 9, totalPages: 1 } }) as Envelope<PostDoc[]>,
  );
  const posts = envelope.data ?? [];
  const meta = envelope.meta ?? { total: 0, page, limit: 9, totalPages: 1 };

  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        title={activeCategory?.name ?? 'Travel stories & guides'}
        description="Practical guides, destination inspiration and insider tips to help you travel better."
        image="/images/banner/about-us-1.webp"
        crumbs={[{ label: 'Travel blog', href: '/blog' }, ...(activeCategory ? [{ label: activeCategory.name }] : [])]}
      />
      <div className="container-page py-12 sm:py-16">
        {posts.length === 0 ? (
          <EmptyState title="No stories yet" description="Our travel journal is just getting started. Check back soon." />
        ) : (
          <>
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group mb-10 grid overflow-hidden rounded-2xl border bg-card card-hover lg:grid-cols-2"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted lg:aspect-auto">
                  {featured.image && (
                    <img src={featured.image} alt={featured.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-10">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {featured.createdAt ? new Date(featured.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Recent'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" /> 5 min read
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-balance group-hover:text-primary sm:text-3xl">{featured.title}</h2>
                  {featured.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>}
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read the story <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-2xl border bg-card card-hover">
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {post.image && (
                      <img src={post.image} alt={post.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    )}
                  </div>
                  <div className="p-5">
                    <time className="text-xs text-muted-foreground">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}
                    </time>
                    <h3 className="mt-2 line-clamp-2 font-semibold leading-snug group-hover:text-primary">{post.title}</h3>
                    {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Read more <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination page={meta.page} totalPages={meta.totalPages} basePath="/blog" params={{ search, category: activeCategory?.id ?? '' }} />
          </>
        )}
      </div>
    </>
  );
}
