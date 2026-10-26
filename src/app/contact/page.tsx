import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { serverGetSafe } from '@/lib/api';
import type { PageDoc } from '@/lib/types';
import { PageHero } from '@/components/site/page-hero';
import { ContactForm } from '@/components/site/contact-form';

export const metadata = {
  title: 'Contact us',
  description: 'Get in touch with our travel team for help with bookings, tickets or trip planning.',
};

export default async function ContactPage() {
  const page = await serverGetSafe<PageDoc | null>('/pages/contact', null, 300);

  return (
    <>
      <PageHero
        title="Contact us"
        description="Questions about a booking, a specific tour, or planning a trip? We are here to help."
        image="/images/banner/about-us-2.webp"
        crumbs={[{ label: 'Contact' }]}
      />
      <div className="container-page grid gap-8 py-12 lg:grid-cols-[1fr_360px]">
        <ContactForm />

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <img src="/images/contact.webp" alt="" className="aspect-[16/10] w-full object-cover" />
            <div className="space-y-4 p-5">
              <h2 className="font-semibold">Reach us directly</h2>
              <p className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> Madrid, Spain
              </p>
              <p className="flex items-start gap-3 text-sm text-muted-foreground">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" /> +34 600 123 456
              </p>
              <p className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" /> hello@tourstravel.example
              </p>
              <p className="flex items-start gap-3 text-sm text-muted-foreground">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" /> Monday to Sunday, 08:00–20:00 CET
              </p>
            </div>
          </div>

          {page?.content && (
            <div className="rounded-2xl border bg-card p-5">
              <div className="prose-rich text-sm" dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
