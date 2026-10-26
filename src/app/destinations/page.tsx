import { serverGetSafe } from '@/lib/api';
import type { Category, Showcase } from '@/lib/types';
import { ShowcaseIndex } from '@/components/site/showcase-index';

export const metadata = {
  title: 'Top destinations',
  description: 'Explore the destinations our travellers love most, with hand-picked tours and experiences.',
};

export default async function DestinationsPage() {
  const [showcases, categories] = await Promise.all([
    serverGetSafe<Showcase[]>('/showcases/destination', [], 120),
    serverGetSafe<Category[]>('/categories', [], 300),
  ]);
  return <ShowcaseIndex kind="destination" showcases={showcases} categories={categories} />;
}
