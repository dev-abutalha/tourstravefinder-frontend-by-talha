import { notFound } from 'next/navigation';
import { serverGetSafe } from '@/lib/api';
import type { PageDoc } from '@/lib/types';
import { PageHero } from '@/components/site/page-hero';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await serverGetSafe<PageDoc | null>(`/pages/${slug}`, null, 300);
  if (!page) return { title: 'Page not found' };
  return { title: page.title, description: page.excerpt };
}

export default async function GenericPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await serverGetSafe<PageDoc | null>(`/pages/${slug}`, null, 300);
  if (!page) notFound();

  return (
    <>
      <PageHero
        title={page.title}
        description={page.excerpt}
        image={page.image || '/images/banner/about-us-3.webp'}
        crumbs={[{ label: page.title }]}
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          {page.content ? (
            <div className="prose-rich" dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <p className="text-muted-foreground">This page has no content yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
