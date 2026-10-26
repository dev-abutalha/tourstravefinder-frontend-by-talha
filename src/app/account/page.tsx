import { Suspense } from 'react';
import { AccountDashboard } from '@/components/site/account-dashboard';

export const metadata = { title: 'My account' };

export default function AccountPage() {
  return (
    <Suspense>
      <AccountDashboard />
    </Suspense>
  );
}
