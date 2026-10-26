import { Suspense } from 'react';
import { serverGetSafe } from '@/lib/api';
import type { CheckoutOptions } from '@/lib/types';
import { CheckoutForm } from '@/components/site/checkout-form';

export const metadata = { title: 'Checkout' };

const FALLBACK: CheckoutOptions = {
  extras: [],
  pickupOptions: [],
  departureOptions: [],
  requiresCompanyField: true,
  minTravelers: 1,
  maxTravelers: 50,
};

export default async function CheckoutPage() {
  const options = await serverGetSafe<CheckoutOptions>('/checkout/options', FALLBACK, 300);
  return (
    <Suspense>
      <CheckoutForm options={options} />
    </Suspense>
  );
}
