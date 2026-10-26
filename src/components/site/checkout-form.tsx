'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Loader2, Lock, Minus, Plus, ShieldCheck, Tag, Trash2, UserRound } from 'lucide-react';
import { api, errorMessage, money } from '@/lib/api';
import type { CheckoutOptions } from '@/lib/types';
import { useCart } from '@/components/cart-provider';
import { TurnstileWidget } from './turnstile-widget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHero } from './page-hero';
import { EmptyState } from './empty-state';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email address'),
    confirmEmail: z.string().email('Confirm your email address'),
    phone: z.string().min(6, 'Enter a contact number'),
    country: z.string().optional(),
    address1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().optional(),
    pickupOption: z.string().optional(),
    departureOption: z.string().optional(),
    paymentMethod: z.string().min(1),
    notes: z.string().max(2000).optional(),
    company: z.string().max(0).optional(),
  })
  .refine((values) => values.email.toLowerCase() === values.confirmEmail.toLowerCase(), {
    message: 'Email addresses do not match',
    path: ['confirmEmail'],
  });

type CheckoutValues = z.infer<typeof schema>;

const countries = [
  'Spain', 'France', 'Italy', 'Portugal', 'Germany', 'Netherlands', 'Belgium', 'Ireland', 'United Kingdom',
  'United States', 'Canada', 'Australia', 'New Zealand', 'United Arab Emirates', 'India', 'Japan', 'Brazil', 'Mexico', 'Other',
];

export function CheckoutForm({ options }: { options: CheckoutOptions }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, loading, busy, setExtras, removeItem, applyCoupon, refresh } = useCart();
  const [coupon, setCoupon] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [passengerCount, setPassengerCount] = React.useState(1);
  const [turnstileToken, setTurnstileToken] = React.useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      confirmEmail: '',
      phone: '',
      country: '',
      address1: '',
      city: '',
      state: '',
      postcode: '',
      pickupOption: '',
      departureOption: '',
      paymentMethod: 'card',
      notes: '',
      company: '',
    },
  });

  const selectedExtras = cart?.extras ?? [];
  const travelerTotal = cart?.items.reduce((sum, item) => sum + item.travelerCount, 0) ?? 0;

  React.useEffect(() => {
    setPassengerCount((current) => (current < travelerTotal ? travelerTotal : Math.max(1, current)));
  }, [travelerTotal]);

  React.useEffect(() => {
    if (searchParams.get('coupon')) setCoupon(searchParams.get('coupon') ?? '');
  }, [searchParams]);

  function toggleExtra(extra: CheckoutOptions['extras'][number]) {
    if (!cart) return;
    const exists = selectedExtras.some((item) => item.id === extra.id);
    const next = exists ? selectedExtras.filter((item) => item.id !== extra.id) : [...selectedExtras, extra];
    void setExtras(next);
  }

  async function onSubmit(values: CheckoutValues) {
    if (!cart?.items.length) return;
    if (options.turnstile && !turnstileToken) {
      setSubmitError('Please complete the security check before confirming your booking.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const passengers = Array.from({ length: passengerCount }).map((_, index) => {
        const form = new FormData(document.getElementById('passenger-form') as HTMLFormElement);
        return {
          firstName: String(form.get(`passenger.${index}.firstName`) ?? ''),
          lastName: String(form.get(`passenger.${index}.lastName`) ?? ''),
          passport: String(form.get(`passenger.${index}.passport`) ?? ''),
          nationality: String(form.get(`passenger.${index}.nationality`) ?? ''),
        };
      });

      const res = await api<{
        success: boolean;
        data: { orderNumber: string; orderId: string; status: string; total: number; currency: string };
      }>('/checkout', {
        method: 'POST',
        body: JSON.stringify({
          customer: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            country: values.country,
            address1: values.address1,
            city: values.city,
            state: values.state,
            postcode: values.postcode,
          },
          confirmEmail: values.confirmEmail,
          company: values.company ?? '',
          passengers,
          pickupOption: values.pickupOption || undefined,
          departureOption: values.departureOption || undefined,
          paymentMethod: values.paymentMethod,
          notes: values.notes,
          turnstileToken: turnstileToken || undefined,
          attribution: {
            sourceType: document.referrer ? 'referral' : 'direct',
            referrer: document.referrer || undefined,
            sessionEntry: sessionStorage.getItem('ttf_entry') || undefined,
            deviceType: window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop',
          },
        }),
      });

      sessionStorage.removeItem('ttf_entry');
      await refresh();
      router.push(`/checkout/success?order=${encodeURIComponent(res.data.orderNumber)}&total=${res.data.total}&currency=${res.data.currency}`);
    } catch (error) {
      setSubmitError(errorMessage(error));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  React.useEffect(() => {
    if (!sessionStorage.getItem('ttf_entry')) sessionStorage.setItem('ttf_entry', window.location.href);
  }, []);

  if (loading) {
    return (
      <div className="container-page flex items-center justify-center py-24 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading your cart…
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <PageHero title="Your cart is empty" description="Add an experience to start planning your trip." image="/images/banner/about-us-2.webp" crumbs={[{ label: 'Checkout' }]} />
        <div className="container-page py-16">
          <EmptyState title="Nothing to check out yet" description="Browse our tours and tickets, then come back here to complete your booking." />
          <div className="mt-6 text-center">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/products">Find an experience</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Complete your booking"
        description="You are moments away from your next experience. Review your details and confirm."
        image="/images/banner/about-us-3.webp"
        crumbs={[{ label: 'Checkout' }]}
      />

      <div className="container-page -mt-8 pb-16">
        <form onSubmit={handleSubmit(onSubmit)} id="passenger-form" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <section className="rounded-2xl border bg-card p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <UserRound className="size-4 text-primary" /> Lead traveller details
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">Your tickets and updates will be sent to this email address.</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name *</Label>
                  <Input id="firstName" {...register('firstName')} autoComplete="given-name" />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name *</Label>
                  <Input id="lastName" {...register('lastName')} autoComplete="family-name" />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address *</Label>
                  <Input id="email" type="email" {...register('email')} autoComplete="email" />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmEmail">Confirm email *</Label>
                  <Input id="confirmEmail" type="email" {...register('confirmEmail')} autoComplete="email" />
                  {errors.confirmEmail && <p className="text-xs text-destructive">{errors.confirmEmail.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number *</Label>
                  <Input id="phone" {...register('phone')} autoComplete="tel" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <select id="country" {...register('country')} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address1">Address</Label>
                  <Input id="address1" {...register('address1')} autoComplete="street-address" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register('city')} autoComplete="address-level2" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" {...register('postcode')} autoComplete="postal-code" />
                </div>
              </div>

              <div className="sr-only" aria-hidden="true">
                <Label htmlFor="company">Company</Label>
                <Input id="company" tabIndex={-1} autoComplete="off" {...register('company')} />
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Travellers</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {travelerTotal} traveller{travelerTotal === 1 ? '' : 's'} in your booking. Add passport details if you have them — you can also provide these later.
              </p>

              <div className="mt-4 space-y-4">
                {Array.from({ length: passengerCount }).map((_, index) => (
                  <div key={index} className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-sm font-medium">
                      Traveller {index + 1} {index === 0 ? '(lead traveller)' : ''}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`passenger-${index}-first`}>First name</Label>
                        <Input id={`passenger-${index}-first`} name={`passenger.${index}.firstName`} defaultValue={index === 0 ? watch('firstName') : ''} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`passenger-${index}-last`}>Last name</Label>
                        <Input id={`passenger-${index}-last`} name={`passenger.${index}.lastName`} defaultValue={index === 0 ? watch('lastName') : ''} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`passenger-${index}-passport`}>Passport number</Label>
                        <Input id={`passenger-${index}-passport`} name={`passenger.${index}.passport`} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`passenger-${index}-nationality`}>Nationality</Label>
                        <Input id={`passenger-${index}-nationality`} name={`passenger.${index}.nationality`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setPassengerCount((count) => Math.max(1, count - 1))} disabled={passengerCount <= 1}>
                  <Minus className="size-3.5" />
                </Button>
                <span className="text-sm">{passengerCount} passenger form{passengerCount === 1 ? '' : 's'}</span>
                <Button type="button" variant="outline" size="sm" onClick={() => setPassengerCount((count) => count + 1)}>
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </section>

            {(options.pickupOptions.length > 0 || options.departureOptions.length > 0) && (
              <section className="rounded-2xl border bg-card p-5 sm:p-6">
                <h2 className="text-lg font-semibold">Pickup & departure</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {options.pickupOptions.length > 0 && (
                    <div className="space-y-1.5">
                      <Label htmlFor="pickupOption">Pickup point</Label>
                      <select id="pickupOption" {...register('pickupOption')} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
                        <option value="">Choose a pickup point</option>
                        {options.pickupOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {options.departureOptions.length > 0 && (
                    <div className="space-y-1.5">
                      <Label htmlFor="departureOption">Departure point</Label>
                      <select id="departureOption" {...register('departureOption')} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
                        <option value="">Choose a departure point</option>
                        {options.departureOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="rounded-2xl border bg-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Payment</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose how you would like to pay. We never store card details on our servers.
              </p>
              <div className="mt-4 grid gap-2">
                {[
                  { value: 'card', title: 'Credit or debit card', text: 'Secure payment link sent with your confirmation' },
                  { value: 'paypal', title: 'PayPal', text: 'Pay with your PayPal balance or linked account' },
                  { value: 'bank-transfer', title: 'Bank transfer', text: 'Details will be included in your confirmation email' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/40',
                      watch('paymentMethod') === method.value && 'border-primary bg-accent/40',
                    )}
                  >
                    <input type="radio" value={method.value} {...register('paymentMethod')} className="mt-1 accent-[var(--primary)]" />
                    <span>
                      <span className="block text-sm font-medium">{method.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{method.text}</span>
                    </span>
                  </label>
                ))}
              </div>

              {options.turnstile && (
                <div className="mt-5">
                  <TurnstileWidget siteKey={options.turnstile.siteKey} onToken={setTurnstileToken} />
                </div>
              )}

              <div className="mt-5 space-y-1.5">
                <Label htmlFor="notes">Special requests (optional)</Label>
                <Textarea id="notes" rows={3} placeholder="Dietary requirements, accessibility needs, pickup notes…" {...register('notes')} />
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-2xl border bg-card p-5 shadow-lg">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-4 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.key} className="flex gap-3">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.productImage && <img src={item.productImage} alt="" className="size-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium">{item.productTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.date} {item.time ? `· ${item.time}` : ''}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {Object.entries(item.travelers).filter(([, count]) => count).map(([category, count]) => `${count} ${category}`).join(', ')}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground"
                          onClick={() => removeItem(item.key)}
                        >
                          <Trash2 className="mr-1 size-3" /> Remove
                        </Button>
                        <p className="text-sm font-medium">{money(item.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {options.extras.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Add extras</p>
                  {options.extras.map((extra) => {
                    const checked = selectedExtras.some((item) => item.id === extra.id);
                    return (
                      <label key={extra.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/40">
                        <span className="flex items-center gap-2 text-sm">
                          <Checkbox checked={checked} onCheckedChange={() => toggleExtra(extra)} />
                          {extra.label}
                        </span>
                        <span className="text-sm font-medium">{money(extra.price)}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 space-y-2">
                <Label htmlFor="coupon" className="text-sm">Promo code</Label>
                <div className="flex gap-2">
                  <Input id="coupon" value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Enter code" className="h-9" />
                  <Button type="button" variant="outline" className="h-9" disabled={busy || !coupon.trim()} onClick={() => applyCoupon(coupon.trim())}>
                    <Tag className="mr-1 size-3.5" /> Apply
                  </Button>
                </div>
                {cart.couponCode && <p className="text-xs text-emerald-700">Coupon {cart.couponCode} applied</p>}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(cart.subtotal)}</span></div>
                {cart.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-{money(cart.discountTotal)}</span></div>
                )}
                {cart.feeTotal > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Extras</span><span>{money(cart.feeTotal)}</span></div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground"><span>Includes taxes</span><span>{money(cart.taxTotal)}</span></div>
                <div className="flex justify-between border-t pt-3 text-lg font-semibold"><span>Total</span><span>{money(cart.total)}</span></div>
              </div>

              <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting || busy}>
                {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Lock className="mr-2 size-4" />}
                {submitting ? 'Confirming booking…' : 'Confirm booking'}
              </Button>

              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                By confirming you agree to our <Link href="/pages/terms" className="underline">terms</Link> and{' '}
                <Link href="/pages/privacy" className="underline">privacy policy</Link>.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5 text-emerald-600" /> Secure checkout</span>
                <span className="inline-flex items-center gap-1"><Check className="size-3.5 text-emerald-600" /> Instant confirmation</span>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </>
  );
}
