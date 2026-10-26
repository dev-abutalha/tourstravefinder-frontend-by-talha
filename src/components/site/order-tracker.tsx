'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2, PackageCheck, Search, Ticket, Truck } from 'lucide-react';
import { api, errorMessage, money } from '@/lib/api';
import type { TrackResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHero } from './page-hero';
import { cn } from '@/lib/utils';

const stageMeta = [
  { key: 'received', label: 'Received', icon: PackageCheck },
  { key: 'processing', label: 'Processing', icon: Loader2 },
  { key: 'confirm', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'completed', label: 'Completed', icon: Truck },
];

export function OrderTracker() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = React.useState(searchParams.get('order') ?? searchParams.get('orderNumber') ?? '');
  const [result, setResult] = React.useState<TrackResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [hasAutoSubmitted, setHasAutoSubmitted] = React.useState(false);

  const fetchOrder = React.useCallback(async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api<{ success: boolean; data: TrackResult }>(`/track/${encodeURIComponent(value.trim())}`);
      setResult(res.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const order = searchParams.get('order') ?? searchParams.get('orderNumber');
    if (order && !hasAutoSubmitted) {
      setOrderNumber(order);
      setHasAutoSubmitted(true);
      void fetchOrder(order);
    }
  }, [fetchOrder, hasAutoSubmitted, searchParams]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!orderNumber.trim()) return;
    await fetchOrder(orderNumber);
  }

  const cancelled = result?.stage === 'canceled' || result?.stage === 'refunded';
  const activeIndex = result ? result.stages.indexOf(result.stage) : -1;

  return (
    <>
      <PageHero
        title="Track your booking"
        description="Enter your booking reference to see the latest status of your experience."
        image="/images/banner/about-us-2.webp"
        crumbs={[{ label: 'Order tracker' }]}
      />

      <div className="container-page -mt-8 pb-16">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-xl sm:p-8">
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="Booking reference, e.g. TTF-…"
                className="h-11 pl-9"
              />
            </div>
            <Button type="submit" className="h-11 px-6" disabled={loading}>
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {loading ? 'Checking…' : 'Track booking'}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Booking reference</p>
                  <p className="mt-1 text-lg font-semibold">{result.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                  <p className="mt-1 text-lg font-semibold">{money(result.total, result.currency)}</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  {cancelled ? (
                    <AlertCircle className="size-6 text-destructive" />
                  ) : (
                    <CheckCircle2 className="size-6 text-emerald-600" />
                  )}
                  <div>
                    <p className="font-semibold">{result.label}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              </div>

              {!cancelled && (
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    {stageMeta.map((stage, index) => {
                      const Icon = stage.icon;
                      const reached = activeIndex >= result.stages.indexOf(stage.key);
                      return (
                        <React.Fragment key={stage.key}>
                          <div className="flex flex-col items-center gap-2 text-center">
                            <span
                              className={cn(
                                'flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                                reached ? 'border-primary bg-primary text-white' : 'border-muted bg-background text-muted-foreground',
                              )}
                            >
                              <Icon className={cn('size-4', stage.key === 'processing' && reached && 'animate-spin')} />
                            </span>
                            <span className={cn('text-xs', reached ? 'font-medium text-foreground' : 'text-muted-foreground')}>{stage.label}</span>
                          </div>
                          {index < stageMeta.length - 1 && (
                            <span className={cn('mx-1 h-0.5 flex-1 rounded', activeIndex > result.stages.indexOf(stage.key) ? 'bg-primary' : 'bg-muted')} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wide">Booking details</h3>
                <div className="mt-3 space-y-3">
                  {result.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl border p-3">
                      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.productImage && <img src={item.productImage} alt="" className="size-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.productTitle}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[item.date, item.time, item.optionName].filter(Boolean).join(' · ')}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.travelerCount} traveller(s)</p>
                      </div>
                      <p className="text-sm font-medium">{money(item.total ?? 0, result.currency)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
                <Button asChild variant="outline">
                  <a href={`/account?order=${result.orderNumber}`}>
                    <Ticket className="mr-1.5 size-4" /> View in account
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/contact">Need help?</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
