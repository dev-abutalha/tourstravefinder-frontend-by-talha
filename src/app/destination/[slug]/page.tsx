import { CategoryPageContent } from '@/components/site/category-page';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} tours & experiences` };
}

export default async function DestinationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  return <CategoryPageContent slug={slug} page={Math.max(1, Number(page ?? 1))} eyebrow="Destination" />;
}
