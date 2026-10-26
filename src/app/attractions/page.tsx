import { serverGetSafe } from '@/lib/api';
import type { Category, Showcase } from '@/lib/types';
import { ShowcaseIndex } from '@/components/site/showcase-index';

export const metadata = {
  title: 'Top attractions',
  description: 'Skip-the-line tickets and guided visits to the world&apos;s most iconic attractions.',
};

export default async function AttractionsPage() {
  const [showcases, categories] = await Promise.all([
    serverGetSafe<Showcase[]>('/showcases/attraction', [], 120),
    serverGetSafe<Category[]>('/categories', [], 300),
  ]);
  return <ShowcaseIndex kind="attraction" showcases={showcases} categories={categories} />;
}
