import Link from 'next/link';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { serverGetEnvelope, serverGetSafe } from '@/lib/api';
import type { Category, Envelope, Product, Taxonomy } from '@/lib/types';
import { ProductCard } from '@/components/site/product-card';
import { PageHero } from '@/components/site/page-hero';
import { Pagination } from '@/components/site/pagination';
import { EmptyState } from '@/components/site/empty-state';
import { cn } from '@/lib/utils';

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export const metadata = {
  title: 'Tours, Tickets & Experiences',
  description: 'Browse hand-picked tours, attraction tickets and unique experiences around the world.',
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const get = (key: string) => {
    const value = sp[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const search = get('search') ?? '';
  const categorySlug = get('category') ?? '';
  const activityType = get('activityType') ?? '';
  const sort = get('sort') ?? 'newest';
  const minPrice = get('minPrice') ?? '';
  const maxPrice = get('maxPrice') ?? '';
  const page = Math.max(1, Number(get('page') ?? 1));

  const [categories, activityTypes] = await Promise.all([
    serverGetSafe<Category[]>('/categories', [], 300),
    serverGetSafe<Taxonomy[]>('/taxonomies/activity_type', [], 300),
  ]);

  const selectedCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug || (category as { id?: string }).id === categorySlug)
    : undefined;
  const selectedActivity = activityType
    ? activityTypes.find((type) => type.id === activityType || type.slug === activityType)
    : undefined;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (selectedCategory) params.set('category', selectedCategory.id);
  else if (categorySlug) params.set('category', categorySlug);
  if (activityType) params.set('activityType', activityType);
  if (sort) params.set('sort', sort);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  params.set('limit', '12');
  params.set('page', String(page));

  let envelope: Envelope<Product[]> = { success: true, data: [], meta: { total: 0, page, limit: 12, totalPages: 1 } };
  try {
    envelope = await serverGetEnvelope<Product[]>(`/products?${params.toString()}`, 60);
  } catch {
    envelope = { success: false, data: [], meta: { total: 0, page, limit: 12, totalPages: 1 } };
  }

  const products = envelope.data ?? [];
  const meta = envelope.meta ?? { total: 0, page, limit: 12, totalPages: 1 };

  const activeFilters = [
    search && { key: 'search', label: `Search: ${search}` },
    selectedCategory && { key: 'category', label: selectedCategory.name },
    activityType && { key: 'activityType', label: selectedActivity?.name ?? 'Activity type' },
    minPrice && { key: 'minPrice', label: `Min €${minPrice}` },
    maxPrice && { key: 'maxPrice', label: `Max €${maxPrice}` },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <>
      <PageHero
        title="Tours, tickets & experiences"
        description="From iconic landmarks to local secrets, find the experience that fits your trip."
        image="/images/banner/about-us-1.webp"
        crumbs={[{ label: 'Tours & tickets' }]}
      />

      <div className="container-page grid gap-8 py-12 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
              <Filter className="size-4 text-primary" /> Filters
            </h2>

            <form method="GET" action="/products" className="mt-5 space-y-5">
              <input type="hidden" name="sort" value={sort} />
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Keyword
                </label>
                <Input id="search" name="search" defaultValue={search} placeholder="Tour, city, attraction…" />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={selectedCategory?.slug ?? categorySlug}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name} ({category.productCount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="activityType" className="text-sm font-medium">
                  Activity type
                </label>
                <select
                  id="activityType"
                  name="activityType"
                  defaultValue={selectedActivity?.id ?? activityType}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All activity types</option>
                  {activityTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Price range</p>
                <div className="flex items-center gap-2">
                  <Input name="minPrice" type="number" min="0" defaultValue={minPrice} placeholder="Min" />
                  <span className="text-muted-foreground">–</span>
                  <Input name="maxPrice" type="number" min="0" defaultValue={maxPrice} placeholder="Max" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Apply
                </Button>
                <Button asChild variant="outline">
                  <Link href="/products">Reset</Link>
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Popular categories</h2>
            <ul className="mt-3 space-y-1">
              {categories.slice(0, 8).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-muted"
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-muted-foreground">{category.productCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {meta.total} experience{meta.total === 1 ? '' : 's'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedCategory ? `In ${selectedCategory.name}` : 'Curated for every kind of traveller'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <form method="GET" action="/products">
                {search && <input type="hidden" name="search" value={search} />}
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {activityType && <input type="hidden" name="activityType" value={activityType} />}
                {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
                {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
                <select
                  name="sort"
                  defaultValue={sort}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Sort products"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="sr-only">
                  Sort
                </button>
              </form>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => {
                const next = new URLSearchParams();
                for (const [key, value] of Object.entries(sp)) {
                  if (key === filter.key || key === 'page') continue;
                  if (typeof value === 'string' && value) next.set(key, value);
                }
                const qs = next.toString();
                return (
                  <Link
                    key={filter.key}
                    href={`/products${qs ? `?${qs}` : ''}`}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground hover:bg-accent/70"
                  >
                    {filter.label} <X className="size-3" />
                  </Link>
                );
              })}
              <Link href="/products" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                Clear all
              </Link>
            </div>
          )}

          {products.length > 0 ? (
            <div className={cn('mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3')}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="No experiences match those filters"
                description="Try broadening your search, removing a filter, or exploring all of our tours and tickets."
              />
            </div>
          )}

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            basePath="/products"
            params={{
              search,
              category: categorySlug,
              activityType,
              sort,
              minPrice,
              maxPrice,
            }}
          />
        </div>
      </div>
    </>
  );
}
