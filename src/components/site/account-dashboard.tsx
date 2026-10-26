'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BadgeCheck,
  Download,
  KeyRound,
  Loader2,
  LogOut,
  MapPin,
  PackageSearch,
  Pencil,
  Ticket,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { api, errorMessage, money } from '@/lib/api';
import type { AccountOrder, AccountOrderSummary, Address } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHero } from './page-hero';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  'on-hold': 'On hold',
  'booking-confirm': 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
  refunded: 'Refunded',
};

function statusClass(status: string) {
  if (status === 'completed' || status === 'booking-confirm') return 'bg-emerald-100 text-emerald-800';
  if (status === 'cancelled' || status === 'failed' || status === 'refunded') return 'bg-rose-100 text-rose-800';
  if (status === 'processing') return 'bg-amber-100 text-amber-800';
  return 'bg-muted text-muted-foreground';
}

function AuthPanel() {
  const { login, register } = useAuth();
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(String(form.get('email')), String(form.get('password')));
        toast.success('Welcome back');
      } else {
        await register({
          email: String(form.get('email')),
          password: String(form.get('password')),
          firstName: String(form.get('firstName')),
          lastName: String(form.get('lastName')),
          phone: String(form.get('phone') || '') || undefined,
        });
        toast.success('Your account is ready');
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
        <div className="flex rounded-lg bg-muted p-1">
          <button
            onClick={() => setMode('login')}
            className={cn('flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors', mode === 'login' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode('register')}
            className={cn('flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors', mode === 'register' ? 'bg-background shadow-sm' : 'text-muted-foreground')}
          >
            Create account
          </button>
        </div>

        <h1 className="mt-6 text-2xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'login' ? 'Sign in to view bookings, tickets and invoices.' : 'Keep all your bookings, tickets and details in one place.'}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" name="firstName" required autoComplete="given-name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" name="lastName" required autoComplete="family-name" />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          {mode === 'register' && (
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" autoComplete="tel" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            {mode === 'register' && <p className="text-xs text-muted-foreground">At least 8 characters with upper, lower and a number.</p>}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}

const addressFieldNames = ['firstName', 'lastName', 'phone', 'address1', 'address2', 'city', 'state', 'postcode', 'country'] as const;

function AddressCard({
  title,
  address,
  saving,
  onSubmit,
}: {
  title: string;
  address?: Address;
  saving: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6">
      <h3 className="flex items-center gap-2 font-semibold">
        <MapPin className="size-4 text-primary" /> {title}
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${title}-first`}>First name</Label>
          <Input id={`${title}-first`} name="firstName" defaultValue={address?.firstName} autoComplete="given-name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${title}-last`}>Last name</Label>
          <Input id={`${title}-last`} name="lastName" defaultValue={address?.lastName} autoComplete="family-name" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${title}-address1`}>Address line 1</Label>
          <Input id={`${title}-address1`} name="address1" defaultValue={address?.address1} autoComplete="address-line1" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${title}-address2`}>Address line 2</Label>
          <Input id={`${title}-address2`} name="address2" defaultValue={address?.address2} autoComplete="address-line2" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${title}-city`}>City</Label>
          <Input id={`${title}-city`} name="city" defaultValue={address?.city} autoComplete="address-level2" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${title}-state`}>State / region</Label>
          <Input id={`${title}-state`} name="state" defaultValue={address?.state} autoComplete="address-level1" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${title}-postcode`}>Postcode</Label>
          <Input id={`${title}-postcode`} name="postcode" defaultValue={address?.postcode} autoComplete="postal-code" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${title}-country`}>Country</Label>
          <Input id={`${title}-country`} name="country" defaultValue={address?.country} autoComplete="country-name" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${title}-phone`}>Phone</Label>
          <Input id={`${title}-phone`} name="phone" defaultValue={address?.phone} autoComplete="tel" />
        </div>
      </div>
      <Button type="submit" size="sm" className="mt-4" disabled={saving}>
        {saving ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
        Save {title.toLowerCase()}
      </Button>
    </form>
  );
}

export function AccountDashboard() {
  const { user, loading, logout, refresh } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = React.useState<AccountOrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<AccountOrder | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [savingAddress, setSavingAddress] = React.useState<'billing' | 'shipping' | null>(null);

  const loadOrders = React.useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await api<{ success: boolean; data: AccountOrderSummary[] }>('/account/orders?limit=50');
      setOrders(res.data);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) void loadOrders();
  }, [user, loadOrders]);

  const openOrder = React.useCallback(async (orderNumber: string) => {
    setDetailLoading(true);
    try {
      const res = await api<{ success: boolean; data: AccountOrder }>(`/account/orders/${orderNumber}`);
      setSelected(res.data);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const order = searchParams.get('order');
    if (user && order) void openOrder(order);
  }, [user, searchParams, openOrder]);

  async function onCancel(orderNumber: string) {
    const reason = window.prompt('Why would you like to cancel? (optional)') ?? '';
    try {
      await api(`/account/orders/${orderNumber}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });
      toast.success('Cancellation request sent');
      await openOrder(orderNumber);
      await loadOrders();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function onSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSavingProfile(true);
    try {
      await api('/account', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: String(form.get('firstName') ?? ''),
          lastName: String(form.get('lastName') ?? ''),
          displayName: String(form.get('displayName') ?? ''),
          phone: String(form.get('phone') ?? ''),
          marketingOptIn: form.get('marketingOptIn') === 'on',
        }),
      });
      await refresh();
      toast.success('Profile updated');
      setProfileOpen(false);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const newPassword = String(form.get('newPassword') ?? '');
    if (newPassword !== String(form.get('confirmPassword') ?? '')) {
      toast.error('The new passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await api('/account/password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: String(form.get('currentPassword') ?? ''),
          newPassword,
        }),
      });
      formElement.reset();
      setPasswordOpen(false);
      toast.success('Password updated');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  }

  async function onSaveAddress(kind: 'billing' | 'shipping', event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const address = Object.fromEntries(addressFieldNames.map((name) => [name, String(form.get(name) ?? '').trim()]));
    setSavingAddress(kind);
    try {
      await api('/account/addresses', {
        method: 'PUT',
        body: JSON.stringify({ [kind]: address }),
      });
      await refresh();
      toast.success(`${kind === 'billing' ? 'Billing' : 'Shipping'} address updated`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSavingAddress(null);
    }
  }

  async function onLogout() {
    await logout();
    setOrders([]);
    setSelected(null);
    router.push('/');
  }

  if (loading) {
    return (
      <div className="container-page flex items-center justify-center py-24 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading your account…
      </div>
    );
  }

  if (!user) return <AuthPanel />;

  return (
    <>
      <PageHero
        title={`Hello, ${user.firstName || 'traveller'}`}
        description="Your bookings, tickets and travel details all in one place."
        image="/images/banner/about-us.webp"
        crumbs={[{ label: 'My account' }]}
      />

      <div className="container-page -mt-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
                  <UserRound className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.displayName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Traveller'}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start" onClick={() => setProfileOpen((v) => !v)}>
                  <Pencil className="mr-2 size-3.5" /> Edit profile
                </Button>
                <Button variant="ghost" size="sm" className="justify-start text-muted-foreground" onClick={onLogout}>
                  <LogOut className="mr-2 size-3.5" /> Sign out
                </Button>
              </div>

              {profileOpen && (
                <form onSubmit={onSaveProfile} className="mt-4 space-y-3 border-t pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-first">First name</Label>
                    <Input id="profile-first" name="firstName" defaultValue={user.firstName} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-last">Last name</Label>
                    <Input id="profile-last" name="lastName" defaultValue={user.lastName} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-display">Display name</Label>
                    <Input id="profile-display" name="displayName" defaultValue={user.displayName} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-phone">Phone</Label>
                    <Input id="profile-phone" name="phone" defaultValue={user.phone} />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" name="marketingOptIn" defaultChecked={user.marketingOptIn} className="accent-[var(--primary)]" />
                    Receive travel inspiration
                  </label>
                  <Button type="submit" size="sm" className="w-full" disabled={savingProfile}>
                    {savingProfile ? 'Saving…' : 'Save changes'}
                  </Button>
                </form>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm font-semibold">Need help?</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Questions about a booking or your tickets? Our team is here.</p>
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link href="/contact">Contact support</Link>
              </Button>
            </div>
          </aside>

          <div className="space-y-6">
            <Tabs defaultValue="bookings">
              <TabsList>
                <TabsTrigger value="bookings">My bookings</TabsTrigger>
                <TabsTrigger value="details">Account details</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="mt-4">
                {ordersLoading ? (
                  <div className="flex items-center justify-center rounded-2xl border bg-card py-16 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 size-4 animate-spin" /> Loading bookings…
                  </div>
                ) : orders.length === 0 ? (
                  <div className="rounded-2xl border bg-card p-10 text-center">
                    <PackageSearch className="mx-auto size-10 text-muted-foreground" />
                    <p className="mt-3 font-medium">No bookings yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">When you book an experience, it will appear here.</p>
                    <Button asChild className="mt-5">
                      <Link href="/products">Browse experiences</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => openOrder(order.orderNumber)}
                        className="flex w-full flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/20"
                      >
                        <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                          {order.firstItemImage && <img src={order.firstItemImage} alt="" className="size-full object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-medium">{order.firstItemTitle || 'Booking'}</p>
                            <Badge className={cn('border-0', statusClass(order.status))}>{statusLabels[order.status] ?? order.status}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.orderNumber} · {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} · {order.itemCount} item(s)
                          </p>
                        </div>
                        <p className="font-semibold">{money(order.total, order.currency)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-4 space-y-6">
                <div className="rounded-2xl border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">Account details</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Your personal information and booking history.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setProfileOpen((v) => !v)}>
                      <Pencil className="mr-2 size-3.5" /> Edit profile
                    </Button>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Bookings</p>
                      <p className="mt-1 text-lg font-semibold">{user.orderCount ?? orders.length}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Total spent</p>
                      <p className="mt-1 text-lg font-semibold">{money(user.totalSpent ?? 0, user.siteCurrency ?? 'EUR')}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Member since</p>
                      <p className="mt-1 text-lg font-semibold">{user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—'}</p>
                    </div>
                  </div>
                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                    <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Name</dt><dd className="mt-1">{user.displayName || `${user.firstName ?? ''} ${user.lastName ?? ''}`}</dd></div>
                    <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Email</dt><dd className="mt-1">{user.email}</dd></div>
                    <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Phone</dt><dd className="mt-1">{user.phone || 'Not set'}</dd></div>
                    <div><dt className="text-xs uppercase tracking-wide text-muted-foreground">Marketing</dt><dd className="mt-1">{user.marketingOptIn ? 'Subscribed' : 'Not subscribed'}</dd></div>
                  </dl>
                  <Separator className="my-5" />
                  <p className="text-xs text-muted-foreground">To change your email address or close your account, please contact our support team.</p>
                </div>

                <div className="rounded-2xl border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="flex items-center gap-2 font-semibold"><KeyRound className="size-4 text-primary" /> Password</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Use at least 8 characters with upper, lower and a number.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPasswordOpen((v) => !v)}>
                      {passwordOpen ? 'Cancel' : 'Change password'}
                    </Button>
                  </div>
                  {passwordOpen && (
                    <form onSubmit={onChangePassword} className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="currentPassword">Current password</Label>
                        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="newPassword">New password</Label>
                        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Confirm new password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
                      </div>
                      <div className="sm:col-span-3">
                        <Button type="submit" size="sm" disabled={savingPassword}>
                          {savingPassword ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
                          Update password
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <AddressCard
                    title="Billing address"
                    address={user.billingAddress}
                    saving={savingAddress === 'billing'}
                    onSubmit={(event) => void onSaveAddress('billing', event)}
                  />
                  <AddressCard
                    title="Shipping address"
                    address={user.shippingAddress}
                    saving={savingAddress === 'shipping'}
                    onSubmit={(event) => void onSaveAddress('shipping', event)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelected(null)}>
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-background p-6 shadow-2xl sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Booking {selected.orderNumber}</p>
                <h2 className="mt-1 text-xl font-semibold">{selected.firstItemTitle || 'Your experience'}</h2>
                <Badge className={cn('mt-2 border-0', statusClass(selected.status))}>{statusLabels[selected.status] ?? selected.status}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)} aria-label="Close">
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {(selected.items ?? []).map((item, index) => (
                <div key={index} className="flex gap-3 rounded-xl border p-3">
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.productImage && <img src={item.productImage} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.productTitle}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{[item.date, item.time, item.optionName].filter(Boolean).join(' · ')}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.travelerCount} traveller(s)</p>
                  </div>
                  <p className="text-sm font-medium">{money(item.total ?? 0, selected.currency)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <span className="text-sm font-medium">Total paid</span>
              <span className="text-lg font-semibold">{money(selected.total, selected.currency)}</span>
            </div>

            {selected.cancellation && (
              <div className="mt-4">
                {selected.cancelRequested ? (
                  <Alert>
                    <AlertDescription>Cancellation requested. Our team will review it and be in touch.</AlertDescription>
                  </Alert>
                ) : selected.cancellation.allowed ? (
                  <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                    <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                      <span>This booking is eligible for free cancellation.</span>
                      <Button size="sm" variant="outline" onClick={() => onCancel(selected.orderNumber)}>Request cancellation</Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertDescription>{selected.cancellation.reason || 'This booking is not eligible for free cancellation.'}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">
              <Button asChild variant="outline">
                <a href={`/api/public/account/orders/${selected.orderNumber}/invoice`} target="_blank" rel="noreferrer">
                  <Download className="mr-1.5 size-4" /> Invoice
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/order-tracker?order=${selected.orderNumber}`}>
                  <Ticket className="mr-1.5 size-4" /> Track booking
                </Link>
              </Button>
              <Button asChild variant="ghost" className="ml-auto">
                <Link href="/contact">Need help?</Link>
              </Button>
            </div>

            {selected.ticketFiles?.length ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <p className="flex items-center gap-1.5 text-sm font-medium"><BadgeCheck className="size-4" /> Your tickets are ready</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.ticketFiles.map((_, index) => (
                    <Button key={index} asChild size="sm" variant="outline">
                      <a href={`/api/public/account/orders/${selected.orderNumber}/tickets/${index}`} target="_blank" rel="noreferrer">
                        <Download className="mr-1.5 size-3.5" /> Ticket {index + 1}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <BadgeCheck className="size-3.5 text-emerald-600" /> Tickets will be available here once your booking is confirmed.
              </p>
            )}

            {detailLoading && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                <Loader2 className="mr-1 inline size-3 animate-spin" /> Refreshing…
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
