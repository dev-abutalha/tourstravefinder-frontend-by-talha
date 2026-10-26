import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube, type LucideIcon } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';

const columns = [
  {
    title: 'Explore',
    links: [
      { href: '/products', label: 'All tours & tickets' },
      { href: '/destinations', label: 'Top destinations' },
      { href: '/attractions', label: 'Top attractions' },
      { href: '/blog', label: 'Travel guides' },
      { href: '/faqs', label: 'FAQs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact us' },
      { href: '/pages/terms', label: 'Terms & conditions' },
      { href: '/pages/privacy', label: 'Privacy policy' },
      { href: '/order-tracker', label: 'Order tracker' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/account', label: 'My account' },
      { href: '/account?login=1', label: 'Sign in' },
      { href: '/faqs', label: 'Cancellation policy' },
      { href: '/contact', label: 'Help centre' },
      { href: '/order-tracker', label: 'Booking status' },
    ],
  },
];

const socialIcons: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
};

export function Footer({
  siteName = 'Tours & Travel',
  socials = [],
}: {
  siteName?: string;
  socials?: { label: string; url: string; icon?: string }[];
}) {
  return (
    <footer className="mt-20 bg-navy text-white/70">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <img src="/images/logo-dark.webp" alt={siteName} className="h-10 w-auto" />
            <span className="sr-only">{siteName}</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Hand-picked tours, tickets and unforgettable experiences across the world&apos;s most loved destinations. Book with confidence,
            travel with ease.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Madrid, Spain
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-primary" /> +34 600 123 456
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-primary" /> hello@tourstravel.example
            </p>
          </div>
          {socials.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map((social) => {
                const Icon = socialIcons[(social.icon ?? social.label).toLowerCase()] ?? Facebook;
                return (
                  <a
                    key={`${social.label}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full bg-white/8 text-white/80 transition-colors hover:bg-primary hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{column.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <div className="flex flex-wrap items-center gap-5 text-sm">
            <span className="font-medium text-white">Get travel inspiration</span>
            <NewsletterForm />
          </div>
          <div className="flex items-center gap-2">
            <img src="/images/card-logo/1visa.png" alt="Visa" className="h-6 w-auto rounded bg-white/90 p-1" />
            <img src="/images/card-logo/2master-card.png" alt="Mastercard" className="h-6 w-auto rounded bg-white/90 p-1" />
            <img src="/images/card-logo/applepay.png" alt="Apple Pay" className="h-6 w-auto rounded bg-white/90 p-1" />
          </div>
        </div>
        <div className="container-page flex flex-col items-center justify-between gap-2 border-t border-white/10 py-4 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p>Secure payments · Instant confirmation · 24/7 support</p>
        </div>
      </div>
    </footer>
  );
}
