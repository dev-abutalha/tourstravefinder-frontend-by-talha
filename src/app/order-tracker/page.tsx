import { Suspense } from 'react';
import { OrderTracker } from '@/components/site/order-tracker';

export const metadata = {
  title: 'Track your booking',
  description: 'Check the latest status of your booking and view your experience details.',
};

export default function OrderTrackerPage() {
  return (
    <Suspense>
      <OrderTracker />
    </Suspense>
  );
}
