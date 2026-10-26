import { CartPageClient } from '@/components/site/cart-page-client';
import { PageHero } from '@/components/site/page-hero';

export const metadata = { title: 'Your cart' };

export default function CartPage() {
  return (
    <>
      <PageHero
        title="Your cart"
        description="Review your experiences, update travellers or apply a coupon before checkout."
        image="/images/banner/about-us-2.webp"
        crumbs={[{ label: 'Cart' }]}
      />
      <CartPageClient />
    </>
  );
}
