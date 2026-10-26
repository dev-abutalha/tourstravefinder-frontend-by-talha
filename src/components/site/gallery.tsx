'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Expand, Images } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function Gallery({ images, title }: { images: { url: string; alt?: string }[]; title: string }) {
  const safe = images.filter((image) => image.url);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const current = safe[active] ?? safe[0];
  const visible = safe.slice(0, 3);

  const openGallery = (index: number) => {
    setActive(index);
    setOpen(true);
  };

  const move = React.useCallback(
    (direction: number) => {
      setActive((index) => (index + direction + safe.length) % safe.length);
    },
    [safe.length],
  );

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, move]);

  if (!safe.length) {
    return (
      <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-muted text-muted-foreground">
        <Images className="size-8" />
        <p className="text-sm">{title}</p>
      </div>
    );
  }

  const mainSpan = visible.length === 1 ? 'col-span-3 row-span-2' : 'col-span-2 row-span-2';
  const sideSpan = visible.length === 2 ? 'col-span-1 row-span-2' : 'col-span-1 row-span-1';

  return (
    <>
      <div className="grid h-[280px] grid-cols-3 grid-rows-2 gap-2 sm:h-[380px] lg:h-[500px]">
        {visible.map((image, index) => {
          const isMain = index === 0;
          return (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => openGallery(index)}
              className={cn(
                'group relative overflow-hidden rounded-xl bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                isMain ? mainSpan : sideSpan,
              )}
              aria-label={isMain ? `Show full gallery with ${safe.length} photos` : `Open photo ${index + 1} of ${safe.length}`}
            >
              <img
                src={image.url}
                alt={image.alt || `${title} photo ${index + 1}`}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {isMain && (
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors group-hover:bg-black/80">
                  <Expand className="size-3.5" /> Show full gallery
                </span>
              )}
              {!isMain && index === 2 && safe.length > 3 && (
                <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  +{safe.length - 3} photos
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl border-0 bg-black/95 p-3 text-white sm:p-4">
          <DialogTitle className="sr-only">{title} gallery</DialogTitle>
          <div className="flex items-center justify-between gap-3 pr-8 text-xs text-white/70">
            <span className="line-clamp-1">{title}</span>
            <span className="shrink-0">{active + 1} / {safe.length}</span>
          </div>

          <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-lg bg-black">
            <img
              src={current.url}
              alt={current.alt || `${title} photo ${active + 1}`}
              className="max-h-[60vh] w-full object-contain"
            />
            {safe.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {safe.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {safe.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    'relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                    index === active ? 'border-white' : 'border-transparent opacity-55 hover:opacity-100',
                  )}
                  aria-label={`View photo ${index + 1}`}
                  aria-current={index === active}
                >
                  <img src={image.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
