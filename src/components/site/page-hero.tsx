import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function PageHero({
  title,
  description,
  image = '/images/banner/about-us.webp',
  crumbs = [],
}: {
  title: string;
  description?: string;
  image?: string;
  crumbs?: { href?: string; label: string }[];
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      <div className="absolute inset-0 -z-10 hero-gradient" />
      <div className="container-page py-16 text-white sm:py-20">
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-white/70">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.label} className="inline-flex items-center gap-1.5">
              <ChevronRight className="size-3" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-white">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="max-w-3xl text-3xl font-semibold text-balance sm:text-4xl lg:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">{description}</p>}
      </div>
    </section>
  );
}
