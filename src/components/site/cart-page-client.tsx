'use client';

import * as React from 'react';
import Link from 'next/link';
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { money } from '@/lib/api';

export function CartPageClient() {
  const { cart, loading, busy, updateTravelers, removeItem, applyCoupon } = useCart();
  const [coupon, setCoupon] = React.useState(cart?.couponCode ?? '');

  React.useEffect(() => {
    setCoupon(cart?.couponCode ?? '');
  }, [cart?.couponCode]);

  if (loading) {
    return (
      <div className="container-page flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-6 text-muted-foreground" />
        </span>
        <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">Browse our experiences and add something you'd love to do.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Find tours & experiences</Link>
        </Button>
      </div>
    );
  }

  async function changeTravelers(key: string, current: number, delta: number) {
    const next = Math.max(1, current + delta);
    await updateTravelers(key, { Adult: next } as any);
  }

  async function submitCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!coupon.trim()) return;
    await applyCoupon(coupon.trim());
  }

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Shopping cart</h1>
        {cart.items.map((item) => (
          <article key={item.key} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-col gap-4 p-4 sm:flex-row">
              <div className="relative h-40 w-full overflow-hidden rounded-xl sm:h-32 sm:w-40">
                {item.productImage && <img src={item.productImage} alt={item.productTitle} className="size-full object-cover" />}
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/products/${item.productSlug}`} className="text-base font-semibold hover:text-primary">
                      {item.productTitle}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[item.optionName, item.date, item.time].filter(Boolean).join(' · ')}
                    </p>
                    {!item.available && item.unavailableReason && <p className="mt-1 text-xs text-destructive">{item.unavailableReason}</p>}
                  </div>
                  <p className="text-base font-semibold">{money(item.total, 'EUR')}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 rounded-full border px-2 py-1">
                    <Button variant="ghost" size="icon" className="size-8 rounded-full" disabled={busy || (item.travelers?.Adult || 1) <= 1} onClick={() => changeTravelers(item.key, item.travelers?.Adult || 1, -1)}>
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-10 text-center text-sm">{item.travelers?.Adult || 1}</span>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full" disabled={busy} onClick={() => changeTravelers(item.key, item.travelers?.Adult || 1, 1)}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground" disabled={busy} onClick={() => removeItem(item.key)}>
                    <Trash2 className="mr-1.5 size-4" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{money(cart.subtotal, 'EUR')}</dd>
            </div>
            {cart.discountTotal > 0 && (
              <div className="flex items-center justify-between text-emerald-600">
                <dt>Discount</dt>
                <dd>-{money(cart.discountTotal, 'EUR')}</dd>
              </div>
            )}
            {cart.feeTotal > 0 && (
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Extras</dt>
                <dd>{money(cart.feeTotal, 'EUR')}</dd>
              </div>
            )}
            <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{money(cart.total, 'EUR')}</dd>
            </div>
          </dl>
          <Button asChild className="mt-5 w-full" disabled={cart.items.some((i) => !i.available)}>
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          {cart.items.some((i) => !i.available) && <p className="mt-2 text-center text-xs text-destructive">Remove unavailable items to continue.</p>}
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold">Coupon code</h3>
          <form onSubmit={submitCoupon} className="mt-3 flex gap-2">
            <div className="flex-1">
              <Label htmlFor="coupon" className="sr-only">Coupon</Label>
              <Input id="coupon" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter code" />
            </div>
            <Button type="submit" variant="outline" disabled={busy || !coupon.trim()}>Apply</Button>
          </form>
          {cart.couponCode && <p className="mt-2 text-xs text-muted-foreground">Applied: {cart.couponCode}</p>}
        </div>
      </aside>
    </div>
  );
}
