'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Loader2, MapPin, Package, Search, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Envelope, SearchPayload } from '@/lib/types';

type SearchItem = {
  id: string;
  name: string;
  href: string;
  image?: string;
  meta: string;
};

type SearchGroup = {
  key: 'categories' | 'products' | 'posts';
  label: string;
  items: SearchItem[];
  start: number;
};

interface RealtimeSearchProps {
  className?: string;
  controlClassName?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  placeholder?: string;
  buttonLabel?: string;
  showButton?: boolean;
  autoFocus?: boolean;
  compact?: boolean;
  layout?: 'inline' | 'split';
  onNavigate?: () => void;
}

function buildGroups(results: SearchPayload | null): SearchGroup[] {
  let offset = 0;
  const groups: Omit<SearchGroup, 'start'>[] = [
    {
      key: 'categories',
      label: 'Destinations',
      items: (results?.categories ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        href: `/categories/${category.slug}`,
        image: category.image,
        meta: category.categoryType === 'attraction' ? 'Attraction' : 'Destination',
      })),
    },
    {
      key: 'products',
      label: 'Tours & tickets',
      items: (results?.products ?? []).map((product) => ({
        id: product.id,
        name: product.title,
        href: `/products/${product.slug}`,
        image: product.image,
        meta: 'Tour & ticket',
      })),
    },
    {
      key: 'posts',
      label: 'Travel guides',
      items: (results?.posts ?? []).map((post) => ({
        id: post.id,
        name: post.title,
        href: `/blog/${post.slug}`,
        image: post.image,
        meta: 'Travel guide',
      })),
    },
  ];

  return groups.map((group) => {
    const start = offset;
    offset += group.items.length;
    return { ...group, start };
  });
}

export function RealtimeSearch({
  className,
  controlClassName,
  inputClassName,
  dropdownClassName,
  placeholder = 'Search tours, destinations…',
  buttonLabel = 'Find',
  showButton = true,
  autoFocus = false,
  compact = false,
  layout = 'inline',
  onNavigate,
}: RealtimeSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = React.useRef<HTMLFormElement>(null);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchPayload | null>(null);
  const [resultsQuery, setResultsQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const trimmedQuery = query.trim();
  const visibleResults = results && resultsQuery === trimmedQuery ? results : null;
  const groups = React.useMemo(() => buildGroups(visibleResults), [visibleResults]);
  const flatItems = React.useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const total = flatItems.length;

  React.useEffect(() => {
    setActiveIndex(-1);
    if (!trimmedQuery) {
      setResults(null);
      setResultsQuery('');
      setLoading(false);
      setOpen(false);
      return;
    }

    setOpen(true);
    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      api<Envelope<SearchPayload>>(
        `/search?q=${encodeURIComponent(trimmedQuery)}&limit=5`,
        { signal: controller.signal },
      )
        .then((response) => {
          if (controller.signal.aborted) return;
          setResults(response.data);
          setResultsQuery(trimmedQuery);
          setLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setResults(null);
          setResultsQuery(trimmedQuery);
          setLoading(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  function goTo(href: string) {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function selectItem(item: SearchItem) {
    goTo(item.href);
  }

  async function submitSearch() {
    if (!trimmedQuery || submitting) return;
    setSubmitting(true);
    setOpen(false);

    let category = visibleResults?.categories.find(
      (item) => item.name.toLowerCase() === trimmedQuery.toLowerCase(),
    );

    if (!category) {
      category = visibleResults?.categories?.[0];
    }

    if (!category) {
      try {
        const response = await api<Envelope<SearchPayload>>(
          `/search?q=${encodeURIComponent(trimmedQuery)}&type=categories&limit=5`,
        );
        const categories = response.data.categories;
        category =
          categories.find((item) => item.name.toLowerCase() === trimmedQuery.toLowerCase()) ??
          categories[0];
      } catch {
        category = undefined;
      }
    }

    onNavigate?.();
    router.push(category ? `/categories/${category.slug}` : `/search?q=${encodeURIComponent(trimmedQuery)}`);
    setSubmitting(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (activeIndex >= 0 && flatItems[activeIndex]) {
      selectItem(flatItems[activeIndex]);
      return;
    }
    void submitSearch();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      if (!total) return;
      setActiveIndex((current) => (current + 1) % total);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!total) return;
      setActiveIndex((current) => (current <= 0 ? total - 1 : current - 1));
    }
  }

  const showResults = open && Boolean(trimmedQuery);
  const busy = loading || submitting;

  return (
    <form
      ref={rootRef}
      onSubmit={handleSubmit}
      className={cn('relative w-full', className)}
      role="search"
    >
      {layout === 'split' ? (
        <div
          className={cn(
            'flex flex-col gap-2 rounded-2xl p-2 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:rounded-full',
            controlClassName,
          )}
        >
          <div className="flex h-11 shrink-0 items-center gap-2 px-3 sm:flex-1">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                if (trimmedQuery) setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoComplete="off"
              autoFocus={autoFocus}
              className={cn(
                'h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0',
                inputClassName,
              )}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setQuery('');
                  setOpen(false);
                }}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {showButton && (
            <Button
              type="submit"
              size="lg"
              aria-busy={busy}
              className="h-11 shrink-0 rounded-full px-7"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : buttonLabel}
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center gap-2 rounded-full border bg-background px-3 transition-shadow focus-within:shadow-md',
            compact ? 'h-10' : 'h-11',
            controlClassName,
          )}
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (trimmedQuery) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            autoFocus={autoFocus}
            className={cn(
              'h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0',
              inputClassName,
            )}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => {
                setQuery('');
                setOpen(false);
              }}
            >
              <X className="size-3.5" />
            </button>
          )}
          {showButton && (
            <Button
              type="submit"
              size={compact ? 'sm' : 'default'}
              aria-busy={busy}
              className={cn('shrink-0 rounded-full', compact ? 'h-8 px-3 text-xs' : 'h-9 px-4')}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : buttonLabel}
            </Button>
          )}
        </div>
      )}

      {showResults && (
        <div
          className={cn(
            'absolute left-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-2xl animate-in fade-in-0 slide-in-from-top-1 duration-150',
            dropdownClassName ?? 'w-[min(390px,calc(100vw-2rem))]',
          )}
        >
          <div className="max-h-[min(65vh,440px)] overflow-y-auto p-1.5">
            {loading && !visibleResults ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </div>
            ) : total === 0 && !loading ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing found</div>
            ) : (
              groups.map((group) =>
                group.items.length > 0 ? (
                  <div key={group.key} className="mb-1 last:mb-0">
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.label}
                    </p>
                    {group.items.map((item, index) => {
                      const itemIndex = group.start + index;
                      const active = itemIndex === activeIndex;
                      return (
                        <Link
                          key={`${group.key}-${item.id}`}
                          href={item.href}
                          onClick={() => {
                            setOpen(false);
                            onNavigate?.();
                          }}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors',
                            active ? 'bg-muted' : 'hover:bg-muted/70',
                          )}
                        >
                          {group.key === 'categories' ? (
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <MapPin className="size-4" />
                            </span>
                          ) : group.key === 'posts' ? (
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                              <BookOpen className="size-4" />
                            </span>
                          ) : item.image ? (
                            <img src={item.image} alt="" className="size-9 shrink-0 rounded-full object-cover" loading="lazy" />
                          ) : (
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <Package className="size-4" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{item.name}</span>
                            <span className="block truncate text-[11px] text-muted-foreground">{item.meta}</span>
                          </span>
                          {active && <ArrowRight className="size-3.5 shrink-0 text-primary" />}
                        </Link>
                      );
                    })}
                  </div>
                ) : null,
              )
            )}
          </div>

          <Link
            href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-muted"
          >
            View all results for “{trimmedQuery}”
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </form>
  );
}
