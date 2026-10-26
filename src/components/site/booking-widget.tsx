'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format, isBefore, startOfDay } from 'date-fns';
import { CalendarClock, Check, Clock3, Globe2, Loader2, Minus, Plus, ShieldCheck, Users } from 'lucide-react';
import { api, errorMessage, money } from '@/lib/api';
import type { PriceQuote, ProductFull, Travelers } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/components/cart-provider';

const CATEGORY_ORDER = ['Adult', 'Youth', 'Senior', 'Child', 'Infant'];

export function BookingWidget({ product }: { product: ProductFull }) {
  const router = useRouter();
  const { addItem, busy } = useCart();
  const options = product.productOptions ?? [];
  const [optionIndex, setOptionIndex] = React.useState(
    Math.max(
      0,
      options.findIndex((option) => option.active),
    ),
  );
  const [date, setDate] = React.useState<Date | undefined>();
  const [time, setTime] = React.useState('');
  const [language, setLanguage] = React.useState('');
  const [travelers, setTravelers] = React.useState<Travelers>({ Adult: 1 });
  const [quote, setQuote] = React.useState<PriceQuote | null>(null);
  const [quoteError, setQuoteError] = React.useState('');
  const [loadingQuote, setLoadingQuote] = React.useState(false);
  const [availableDates, setAvailableDates] = React.useState<string[] | null>(null);

  const option = options[optionIndex];
  const priceRows = option?.prices ?? [];
  const categories = CATEGORY_ORDER.filter((category) => priceRows.some((row) => row.category === category));
  const times = option?.startTime ?? [];
  const languages = option?.languages ?? [];

  React.useEffect(() => {
    if (times.length === 1) setTime(times[0]);
    else setTime('');
    if (languages.length === 1) setLanguage(languages[0]);
    else setLanguage('');
  }, [optionIndex, times.length, languages.length]);

  React.useEffect(() => {
    let cancelled = false;
    setAvailableDates(null);
    api<{ success: boolean; data: { availableDates: string[] } }>(`/availability/${product.id}?option=${optionIndex}`)
      .then((res) => {
        if (!cancelled) setAvailableDates(res.data.availableDates);
      })
      .catch(() => {
        if (!cancelled) setAvailableDates(null);
      });
    return () => {
      cancelled = true;
    };
  }, [product.id, optionIndex]);

  React.useEffect(() => {
    if (!date) {
      setQuote(null);
      return;
    }
    if (times.length && !time) {
      setQuote(null);
      return;
    }
    const total = Object.values(travelers).reduce((sum, value) => sum + (value || 0), 0);
    if (total < 1) {
      setQuote(null);
      return;
    }

    let cancelled = false;
    setLoadingQuote(true);
    setQuoteError('');
    api<{ success: boolean; data: PriceQuote }>('/quote', {
      method: 'POST',
      body: JSON.stringify({
        productId: product.id,
        optionIndex,
        date: format(date, 'yyyy-MM-dd'),
        time: time || undefined,
        travelers,
      }),
    })
      .then((res) => {
        if (!cancelled) setQuote(res.data);
      })
      .catch((error) => {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(errorMessage(error));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingQuote(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, time, travelers, optionIndex, product.id, times.length]);

  function setCount(category: string, next: number) {
    setTravelers((current) => ({ ...current, [category]: Math.max(0, next) }));
  }

  async function onBook() {
    if (!date) return;
    const ok = await addItem({
      productId: product.id,
      optionIndex,
      date: format(date, 'yyyy-MM-dd'),
      time: time || undefined,
      language: language || undefined,
      travelers,
    });
      if (ok) router.push('/cart');
  }

  const today = startOfDay(new Date());
  const isDisabledDate = (day: Date) => {
    if (isBefore(day, today)) return true;
    if (availableDates && !availableDates.includes(format(day, 'yyyy-MM-dd'))) return true;
    return false;
  };

  if (!options.length) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">This experience is not currently bookable online. Please contact us for availability.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-xl sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">From</p>
          <p className="text-2xl font-semibold">{money(product.price, product.currency)}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Instant confirmation</span>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        {options.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Choose an option</p>
            <Select value={String(optionIndex)} onValueChange={(value) => setOptionIndex(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((item) => (
                  <SelectItem key={item.index} value={String(item.index)} disabled={!item.active}>
                    {item.name}
                    {!item.active ? ' (unavailable)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {option?.details && <p className="text-xs text-muted-foreground">{option.details}</p>}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Travel date</p>
          <DatePicker value={date} onChange={(next) => setDate(next)} disabled={isDisabledDate} placeholder="Select a date" />
          {availableDates && availableDates.length === 0 && (
            <p className="text-xs text-destructive">No dates currently available. Please contact us.</p>
          )}
        </div>

        {times.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Start time</p>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent>
                {times.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {languages.length > 1 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Language</p>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4" /> Travellers
          </p>
          {categories.map((category) => {
            const row = priceRows.find((price) => price.category === category);
            const count = travelers[category as keyof Travelers] ?? 0;
            return (
              <div key={category} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">{category}</p>
                  <p className="text-xs text-muted-foreground">{money(row?.computedPrice ?? 0, product.currency)} per person</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-7 rounded-full"
                    onClick={() => setCount(category, count - 1)}
                    disabled={count <= 0}
                    aria-label={`Remove ${category}`}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-5 text-center text-sm font-medium">{count}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="size-7 rounded-full"
                    onClick={() => setCount(category, count + 1)}
                    disabled={count >= 20}
                    aria-label={`Add ${category}`}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {quoteError && (
          <Alert variant="destructive">
            <AlertDescription>{quoteError}</AlertDescription>
          </Alert>
        )}

        {quote && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{money(quote.subtotal, quote.currency)}</span>
            </div>
            {quote.surcharge > 0 && (
              <div className="flex items-center justify-between text-amber-700">
                <span>Last-minute surcharge ({quote.surchargePercent}%)</span>
                <span>{money(quote.surcharge, quote.currency)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{money(quote.total, quote.currency)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Includes taxes and service charges. No hidden fees.</p>
          </div>
        )}

        <Button className="w-full" size="lg" onClick={onBook} disabled={!date || (times.length > 0 && !time) || !quote || busy || loadingQuote}>
          {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CalendarClock className="mr-2 size-4" />}
          {busy ? 'Adding to cart…' : 'Book now'}
        </Button>

        <div className="grid gap-1.5 text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-emerald-600" /> Free cancellation available on selected options
          </p>
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600" /> Secure checkout and instant confirmation
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" /> Duration: {option?.duration || 'Varies'}
          </p>
          {option?.cutoff && (
            <p className="inline-flex items-center gap-1.5">
              <Globe2 className="size-3.5" /> Book at least {option.cutoff} in advance
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
