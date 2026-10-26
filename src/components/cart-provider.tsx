'use client';

import * as React from 'react';
import { api, errorMessage } from '@/lib/api';
import type { CartView, Travelers } from '@/lib/types';
import { toast } from 'sonner';

interface AddItemInput {
  productId: string;
  optionIndex: number;
  date: string;
  time?: string;
  language?: string;
  travelers: Travelers;
}

interface CartContextValue {
  cart: CartView | null;
  loading: boolean;
  busy: boolean;
  refresh: () => Promise<void>;
  addItem: (input: AddItemInput) => Promise<boolean>;
  updateTravelers: (key: string, travelers: Travelers) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  setExtras: (extras: { id: string; label: string; price: number }[]) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<CartView | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const data = await api<{ success: boolean; data: CartView }>('/cart');
      setCart(data.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = React.useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      try {
        await fn();
      } catch (error) {
        toast.error(errorMessage(error));
        throw error;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const addItem = React.useCallback(
    async (input: AddItemInput) => {
      let ok = false;
      await run(async () => {
        const res = await api<{ success: boolean; data: { cart: CartView } }>('/cart/items', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        setCart(res.data.cart);
        toast.success('Added to your cart');
        ok = true;
      }).catch(() => undefined);
      return ok;
    },
    [run],
  );

  const updateTravelers = React.useCallback(
    async (key: string, travelers: Travelers) => {
      await run(async () => {
        const res = await api<{ success: boolean; data: { cart: CartView } }>(`/cart/items/${key}`, {
          method: 'PATCH',
          body: JSON.stringify({ travelers }),
        });
        setCart(res.data.cart);
      }).catch(() => undefined);
    },
    [run],
  );

  const removeItem = React.useCallback(
    async (key: string) => {
      await run(async () => {
        const res = await api<{ success: boolean; data: CartView }>(`/cart/items/${key}`, { method: 'DELETE' });
        setCart(res.data);
        toast.success('Removed from cart');
      }).catch(() => undefined);
    },
    [run],
  );

  const setExtras = React.useCallback(
    async (extras: { id: string; label: string; price: number }[]) => {
      await run(async () => {
        const res = await api<{ success: boolean; data: CartView }>('/cart/extras', {
          method: 'POST',
          body: JSON.stringify({ extras }),
        });
        setCart(res.data);
      }).catch(() => undefined);
    },
    [run],
  );

  const applyCoupon = React.useCallback(
    async (code: string) => {
      await run(async () => {
        const res = await api<{ success: boolean; data: CartView; message?: string }>('/cart/coupon', {
          method: 'POST',
          body: JSON.stringify({ code }),
        });
        setCart(res.data);
        if (res.success) toast.success(res.message ?? 'Coupon applied');
        else toast.error(res.message ?? 'That coupon is not valid');
      });
    },
    [run],
  );

  const clear = React.useCallback(async () => {
    await run(async () => {
      const res = await api<{ success: boolean; data: CartView }>('/cart', { method: 'DELETE' });
      setCart(res.data);
    }).catch(() => undefined);
  }, [run]);

  const value = React.useMemo(
    () => ({ cart, loading, busy, refresh, addItem, updateTravelers, removeItem, setExtras, applyCoupon, clear }),
    [cart, loading, busy, refresh, addItem, updateTravelers, removeItem, setExtras, applyCoupon, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
