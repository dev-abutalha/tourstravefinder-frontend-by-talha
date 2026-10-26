import Link from 'next/link';
import type { Category, PageMeta, Product } from '@/lib/types';
import { serverGetEnvelope } from '@/lib/api';
import type { Envelope } from '@/lib/types';
import { ProductCard } from './product-card';
import { PageHero } from './page-hero';
import { Pagination } from './pagination';
import { EmptyState } from './empty-state';
import { Button } from '@/components/ui/button';

type CategoryPayload = Envelope<Category> & {
  products?: Product[];
  meta?: PageMeta;
};

export async function CategoryPageContent({
  slug,
  page = 1,
  eyebrow,
}: {
  slug: string;
  page?: number;
  eyebrow?: string;
}) {
  const payload = await serverGetEnvelope<Category>(`/categories/${slug}?page=${page}&limit=12`, 120)
    .then((envelope) => envelope as CategoryPayload)
    .catch(() => null);
  if (!payload || !payload.data) {
    return (
      <div className="container-page py-24">
        <EmptyState title="Category not found" description="The category you are looking for may have moved." />
        <div className="mt-6 text-center">
          <Button asChild>
            <Link href="/products">Browse all experiences</Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = payload.data;
  const products = payload.products ?? [];
  const meta = payload.meta ?? { total: products.length, page, limit: 12, totalPages: 1 };

  return (
    <>
      <PageHero
        title={category.name}
        description={category.description || `Discover the best tours, tickets and experiences in ${category.name}.`}
        image={category.image || '/images/banner/about-us-2.webp'}
        crumbs={[{ href: '/products', label: 'Tours & tickets' }, { label: category.name }]}
      />

      <div className="container-page py-12">
        {category.children && category.children.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {category.children.map((child) => (
              <Button key={child.id} asChild variant="outline" size="sm" className="rounded-full">
                <Link href={`/categories/${child.slug}`}>{child.name}</Link>
              </Button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow || 'Explore'}</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {meta.total} experience{meta.total === 1 ? '' : 's'}
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/products">All experiences</Link>
          </Button>
        </div>

        {products.length ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <EmptyState title="No experiences here yet" description="We are adding new tours all the time. Explore all experiences in the meantime." />
          </div>
        )}

        <Pagination page={meta.page} totalPages={meta.totalPages} basePath={`/categories/${slug}`} />
      </div>
    </>
  );
}
