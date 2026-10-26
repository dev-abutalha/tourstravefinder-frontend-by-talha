import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Headphones,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { serverGetSafe } from '@/lib/api';
import type { Category, Faq, Product, PublicSettings, Showcase } from '@/lib/types';
import { SearchBar } from '@/components/site/search-bar';
import { SectionHeading } from '@/components/site/section-heading';
import { ProductCarousel } from '@/components/site/product-carousel';
import { Reveal } from '@/components/site/reveal';
import { RatingStars } from '@/components/site/rating-stars';
import { PromoBanner } from '@/components/site/promo-banner';

interface HomeData {
  featured: Product[];
  newest: Product[];
  destinations: Showcase[];
  attractions: Showcase[];
}

const FALLBACK_HOME: HomeData = { featured: [], newest: [], destinations: [], attractions: [] };

const perks = [
  { icon: Wallet, title: 'Best price guarantee', text: 'Find it cheaper? We will match it.' },
  { icon: CalendarCheck, title: 'Free cancellation', text: 'Flexible plans on selected tours.' },
  { icon: ShieldCheck, title: 'Secure payments', text: 'Encrypted checkout, every time.' },
  { icon: Headphones, title: '24/7 support', text: 'Real people, ready to help.' },
];

const whyUs = [
  { image: '/images/why-choose-us/love.png', title: 'Loved by travellers', text: 'Thousands of five-star reviews from real customers around the world.' },
  { image: '/images/why-choose-us/happy.png', title: 'Happiness guaranteed', text: 'Curated experiences and local experts who know every destination.' },
  { image: '/images/why-choose-us/review.png', title: 'Trusted reviews', text: 'Every review comes from a verified booking, never bought or edited.' },
  { image: '/images/why-choose-us/support.png', title: 'Always here', text: 'From first question to final ticket, our team is with you all the way.' },
];

const testimonials = [
  {
    name: 'Amelia R.',
    location: 'London, UK',
    quote: 'Booking was effortless and our guide in Rome was outstanding. The skip-the-line tickets saved us hours.',
    rating: 5,
  },
  {
    name: 'Daniel K.',
    location: 'Berlin, Germany',
    quote: 'Clear pricing, instant tickets and a support team that actually replies. Exactly what travel booking should be.',
    rating: 5,
  },
  {
    name: 'Sofia M.',
    location: 'Lisbon, Portugal',
    quote: 'We planned three cities in one trip and every experience was exactly as described. Will book again.',
    rating: 5,
  },
];

export default async function HomePage() {
  const [home, categories, faqs, settings] = await Promise.all([
    serverGetSafe<HomeData>('/home', FALLBACK_HOME, 120),
    serverGetSafe<Category[]>('/categories', [], 300),
    serverGetSafe<Faq[]>('/faqs', [], 300),
    serverGetSafe<PublicSettings>('/settings/public', { siteName: 'Tours & Travel', currency: 'EUR', currencySymbol: '€' }, 0),
  ]);

  const featured = home.featured.length ? home.featured : home.newest.slice(0, 8);
  const topCategories = categories.filter((c) => c.categoryType === 'product_cat' || !c.categoryType).slice(0, 8);
  const destinationItems = home.destinations.flatMap((showcase) => showcase.items ?? []).slice(0, 8);
  const attractionItems = home.attractions.flatMap((showcase) => showcase.items ?? []).slice(0, 8);

  return (
    <>
      <section className="relative min-h-[560px] lg:min-h-[640px]">
        <img src="/images/banner/about-us.webp" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="container-page relative flex min-h-[560px] flex-col justify-center py-20 lg:min-h-[640px]">
          <div className="max-w-3xl text-white">
            <Badge className="mb-5 border-white/20 bg-white/10 px-3 py-1.5 text-white backdrop-blur">
              <Sparkles className="mr-1.5 size-3.5" /> Curated experiences, worldwide
            </Badge>
            <h1 className="text-4xl font-semibold leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
              Discover more. <span className="text-amber-300">Travel better.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Hand-picked tours, attraction tickets and unforgettable experiences — with instant confirmation and a team that has your back.
            </p>
            <SearchBar className="mt-8 max-w-2xl" />
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="size-4 text-amber-300" /> Instant confirmation
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-amber-300" /> Secure checkout
              </span>
              <span className="inline-flex items-center gap-2">
                <Star className="size-4 fill-amber-300 text-amber-300" /> 4.9/5 from 12,000+ travellers
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10">
        <div className="container-page">
          <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk) => (
              <div key={perk.title} className="flex items-start gap-3 rounded-xl p-3 hover:bg-muted/60">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                  <perk.icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{perk.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{perk.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PromoBanner promo={settings.promo} />

      <section className="section container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Browse by interest"
          title="Find your kind of adventure"
          description="From city icons to hidden gems, explore experiences built around what you love."
          href="/products"
          linkLabel="All experiences"
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {topCategories.map((category, index) => (
            <Reveal key={category.id} delay={index * 0.04}>
              <Link
                href={`/categories/${category.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-muted"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-navy/90 text-white">
                    <Ticket className="size-8 opacity-60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-semibold">{category.name}</p>
                  <p className="mt-0.5 text-xs text-white/70">{category.productCount} experiences</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Traveller favourites"
            title="Experiences worth planning a trip for"
            description="The tours and tickets our travellers book again and again."
            href="/products?featured=true"
            linkLabel="See all featured"
          />
          <div className="mt-8">
            <ProductCarousel products={featured} />
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid overflow-hidden rounded-3xl bg-navy text-white lg:grid-cols-2">
          <div className="relative min-h-[280px]">
            <img src="/images/banner/about-us-2.webp" alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-navy/40" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Limited-time offers</p>
            <h2 className="mt-3 text-3xl font-semibold text-balance">Your next story starts here</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              Save on hand-picked experiences when you book directly with us. No hidden fees, no surprises — just great trips.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/products?sort=price-asc">
                  Explore deals <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white hover:text-navy">
                <Link href="/contact">Talk to an expert</Link>
              </Button>
            </div>
            <p className="mt-5 text-xs text-white/50">Free cancellation on selected experiences. Terms apply.</p>
          </div>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20">
        <SectionHeading
          eyebrow="Top destinations"
          title="Where travellers are heading right now"
          description="Explore the cities and regions our community loves most."
          href="/destinations"
          linkLabel="All destinations"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinationItems.map((item, index) => (
            <Reveal key={`${item.title}-${index}`} delay={index * 0.04}>
              <Link
                href={item.link || `/products?search=${encodeURIComponent(item.title)}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
              >
                {item.image && (
                  <img src={item.image} alt={item.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-lg font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-white/70">{item.subtitle || 'Explore experiences'}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-300">
                    Discover <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Top attractions"
            title="Skip the line at the world&apos;s icons"
            description="Priority entry and expert guides at the attractions everyone wants to see."
            href="/attractions"
            linkLabel="All attractions"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {attractionItems.map((item, index) => (
              <Reveal key={`${item.title}-${index}`} delay={index * 0.04}>
                <Link
                  href={item.link || `/products?search=${encodeURIComponent(item.title)}`}
                  className="group flex items-center gap-3 rounded-2xl border bg-card p-3 transition-shadow hover:shadow-lg"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.title}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" /> {item.subtitle || 'Instant tickets'}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      View tickets <ArrowRight className="size-3" />
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Why book with us"
          title="Travel confidence, built in"
          description="We sweat the details so you can focus on the experience."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <div className="h-full rounded-2xl border bg-card p-6">
                <img src={item.image} alt="" className="size-14 object-contain" />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-navy py-16 text-white sm:py-20">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Real travellers, real trips</p>
              <h2 className="mt-3 text-3xl font-semibold text-balance">Loved by thousands of explorers</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                We are proud of the trips we help create. Here is what travellers say after experiencing the world with us.
              </p>
              <div className="mt-7 flex items-center gap-4">
                <p className="text-4xl font-semibold">4.9</p>
                <div>
                  <RatingStars value={5} size={16} />
                  <p className="mt-1 text-xs text-white/60">Based on 12,400+ verified reviews</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {testimonials.map((testimonial) => (
                <figure key={testimonial.name} className="rounded-2xl bg-white/6 p-5 backdrop-blur">
                  <RatingStars value={testimonial.rating} />
                  <blockquote className="mt-3 text-sm leading-relaxed text-white/80">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 text-xs text-white/55">
                    <span className="font-medium text-white">{testimonial.name}</span> · {testimonial.location}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Good to know</p>
            <h2 className="mt-3 text-3xl font-semibold text-balance">Questions, answered</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Everything you need to know before you book. Still curious? Our team is one message away.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-full">
              <Link href="/faqs">Browse all FAQs</Link>
            </Button>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.slice(0, 6).map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.title}</AccordionTrigger>
                <AccordionContent>
                  <div dangerouslySetInnerHTML={{ __html: faq.content }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
