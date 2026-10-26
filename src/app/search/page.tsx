import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { serverGetSafe } from '@/lib/api';
import type { Category, PostDoc, Product } from '@/lib/types';
import { PageHero } from '@/components/site/page-hero';
import { ProductCard } from '@/components/site/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/site/empty-state';

interface SearchPayload {
  products: Product[];
  categories: Category[];
  posts: PostDoc[];
}

export const metadata = { title: 'Search' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('limit', '12');

  const results = q
    ? await serverGetSafe<SearchPayload>(`/search?${params.toString()}`, { products: [], categories: [], posts: [] }, 30)
    : { products: [], categories: [], posts: [] };
  const total = results.products.length + results.categories.length + results.posts.length;

  return (
    <>
      <PageHero
        title={q ? `Search results for “${q}”` : 'Search'}
        description={q ? `${total} result${total === 1 ? '' : 's'} across tours, destinations and stories.` : 'Find your next tour, destination or travel story.'}
        image="/images/banner/about-us-3.webp"
        crumbs={[{ label: 'Search' }]}
      />
      <div className="container-page py-12">
        <form action="/search" method="GET" className="mx-auto flex max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} placeholder="Search tours, destinations, stories…" className="h-11 pl-9" />
          </div>
          <Button type="submit" className="h-11 px-6">
            Search
          </Button>
        </form>

        {!q ? (
          <div className="mt-10">
            <EmptyState title="Start with a search" description="Try a destination like Rome, or an experience like skip-the-line tickets." />
          </div>
        ) : total === 0 ? (
          <div className="mt-10">
            <EmptyState title="No results found" description="Try a different keyword, or browse all of our tours and tickets." />
            <div className="mt-5 text-center">
              <Button asChild>
                <Link href="/products">Browse all experiences</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {results.products.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Experiences ({results.products.length})</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {results.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {results.categories.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Destinations & categories ({results.categories.length})</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {results.categories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.slug}`} className="rounded-xl border bg-card p-4 hover:border-primary">
                      <p className="font-medium">{category.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{category.productCount} experiences</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.posts.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold">Stories ({results.posts.length})</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.posts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="rounded-xl border bg-card p-4 hover:border-primary">
                      <p className="font-medium">{post.title}</p>
                      {post.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
