'use client';

import * as React from 'react';
import Link from 'next/link';
import { BadgeCheck, X } from 'lucide-react';
import type { FomoPublicEntry } from '@/lib/types';

export function FomoPopup({ entries }: { entries: FomoPublicEntry[] }) {
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (!entries.length || dismissed) return;
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let nextTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      setIndex((current) => (current + 1) % entries.length);
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), 6000);
      nextTimer = setTimeout(cycle, 15000);
    };

    showTimer = setTimeout(cycle, 7000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [entries.length, dismissed]);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('ttf_fomo_dismissed') === '1') setDismissed(true);
  }, []);

  if (!entries.length || dismissed) return null;
  const entry = entries[index % entries.length];

  function dismiss() {
    sessionStorage.setItem('ttf_fomo_dismissed', '1');
    setDismissed(true);
    setVisible(false);
  }

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 hidden w-[370px] transition-all duration-300 md:block ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
      aria-live="polite"
    >
      <div className="relative flex gap-3 rounded-2xl border bg-card p-3 pr-8 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss recent booking notification"
          className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
        <Link href={`/products/${entry.product.slug}`} className="flex min-w-0 flex-1 gap-3">
          <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            {entry.product.image && <img src={entry.product.image} alt="" className="size-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">{entry.person}</strong> in {entry.country} booked
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug">{entry.product.title}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <BadgeCheck className="size-3.5" /> Verified booking
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
