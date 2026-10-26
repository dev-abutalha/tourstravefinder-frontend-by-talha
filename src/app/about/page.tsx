import Link from 'next/link';
import { BadgeCheck, Globe2, Heart, ShieldCheck, Users } from 'lucide-react';
import { serverGetSafe } from '@/lib/api';
import type { PageDoc } from '@/lib/types';
import { PageHero } from '@/components/site/page-hero';
import { SectionHeading } from '@/components/site/section-heading';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About us',
  description: 'We are a team of travel obsessives curating the best tours, tickets and experiences worldwide.',
};

const values = [
  { icon: Heart, title: 'Traveller first', text: 'Every decision starts with what makes the trip better for you.' },
  { icon: ShieldCheck, title: 'Trust built in', text: 'Clear pricing, secure checkout and honest cancellation policies.' },
  { icon: Globe2, title: 'Local knowledge', text: 'We work with guides and partners who know their destinations inside out.' },
  { icon: BadgeCheck, title: 'Quality curated', text: 'We only list experiences we would book ourselves.' },
];

export default async function AboutPage() {
  const page = await serverGetSafe<PageDoc | null>('/pages/about-us', null, 300);

  return (
    <>
      <PageHero
        title={page?.title || 'About us'}
        description={page?.excerpt || 'We are a team of travel obsessives, building a better way to book experiences.'}
        image="/images/banner/about-us-1.webp"
        crumbs={[{ label: 'About us' }]}
      />

      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow="Our story" title="Travel should feel effortless" />
            <div className="prose-rich mt-4">
              {page?.content ? (
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              ) : (
                <p>
                  We started with a simple idea: booking a great experience should be as enjoyable as the experience itself. Today we bring
                  together hand-picked tours, tickets and local guides in one place, with transparent pricing and support that actually helps.
                </p>
              )}
              <p>
                From the first click to the final ticket, we sweat the small stuff so you can focus on the places, people and moments that make
                a trip unforgettable.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="/images/banner/about-us-1.webp" alt="" className="aspect-[3/4] w-full rounded-2xl object-cover" />
            <img src="/images/banner/about-us-2.webp" alt="" className="mt-8 aspect-[3/4] w-full rounded-2xl object-cover" />
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div key={value.title} className="rounded-2xl border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent text-primary">
                <value.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 rounded-3xl bg-navy p-8 text-white sm:grid-cols-3 sm:p-12">
          {[
            { value: '12k+', label: 'Happy travellers' },
            { value: '480+', label: 'Curated experiences' },
            { value: '4.9/5', label: 'Average review score' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card p-7 sm:flex-row">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
              <Users className="size-6" />
            </span>
            <div>
              <p className="font-semibold">Planning a group trip?</p>
              <p className="text-sm text-muted-foreground">Our team can tailor experiences for families, friends and companies.</p>
            </div>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
