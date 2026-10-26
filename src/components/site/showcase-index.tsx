import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category, Showcase } from '@/lib/types';
import { PageHero } from './page-hero';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { Button } from '@/components/ui/button';

export function ShowcaseIndex({
  kind,
  showcases,
  categories,
}: {
  kind: 'destination' | 'attraction';
  showcases: Showcase[];
  categories: Category[];
}) {
  const isDestination = kind === 'destination';
  const items = showcases.flatMap((showcase) => showcase.items ?? []);
  const title = isDestination ? 'Top destinations' : 'Top attractions';
  const description = isDestination
    ? 'From timeless cities to sun-soaked coastlines, find the places our travellers love most.'
    : 'Skip the queues and see the icons with tickets, tours and expert local guides.';

  return (
    <>
      <PageHero
        title={title}
        description={description}
        image={isDestination ? '/images/banner/about-us-3.webp' : '/images/banner/about-us-2.webp'}
        crumbs={[{ label: title }]}
      />

      <div className="container-page py-12 sm:py-16">
        <SectionHeading
          eyebrow={isDestination ? 'Explore the world' : 'Must-see experiences'}
          title={isDestination ? 'Choose your next destination' : 'The icons, without the queues'}
          description={isDestination ? 'Every destination is packed with hand-picked tours and local experiences.' : 'Priority entry, guided visits and instant mobile tickets.'}
          href="/products"
          linkLabel="All experiences"
        />

        <div className={isDestination ? 'mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'}>
          {items.map((item, index) => (
            <Reveal key={`${item.title}-${index}`} delay={index * 0.035}>
              <Link
                href={item.link || `/products?search=${encodeURIComponent(item.title)}`}
                className="group relative block overflow-hidden rounded-2xl border bg-card card-hover"
              >
                <div className={isDestination ? 'aspect-[4/5]' : 'aspect-[4/3]'}>
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-lg font-semibold">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/70">{item.description || item.subtitle}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-300">
                    View experiences <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Showcase items will appear here once they are published in the admin panel.
          </p>
        )}

        <div className="mt-14">
          <SectionHeading
            eyebrow="Browse by theme"
            title={isDestination ? 'More ways to explore' : 'Find tickets by category'}
            description="Filter our full collection by the experiences that interest you most."
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.slice(0, 16).map((category) => (
              <Button key={category.id} asChild variant="outline" className="rounded-full">
                <Link href={`/categories/${category.slug}`}>
                  {category.name} <span className="ml-1 text-xs text-muted-foreground">{category.productCount}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
