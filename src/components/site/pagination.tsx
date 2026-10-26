import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const build = (p: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value) sp.set(key, value);
    }
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={build(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn('flex size-9 items-center justify-center rounded-full border hover:bg-muted', page === 1 && 'pointer-events-none opacity-40')}
      >
        <ChevronLeft className="size-4" />
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Link
            href={build(p)}
            className={cn(
              'flex size-9 items-center justify-center rounded-full border text-sm hover:bg-muted',
              p === page && 'border-primary bg-primary text-primary-foreground hover:bg-primary',
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={build(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn('flex size-9 items-center justify-center rounded-full border hover:bg-muted', page === totalPages && 'pointer-events-none opacity-40')}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
