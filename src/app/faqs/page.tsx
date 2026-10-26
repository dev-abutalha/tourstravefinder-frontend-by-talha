import { serverGetSafe } from '@/lib/api';
import type { Faq, FaqCategory } from '@/lib/types';
import { PageHero } from '@/components/site/page-hero';
import { FaqList } from '@/components/site/faq-list';

export const metadata = {
  title: 'Frequently asked questions',
  description: 'Answers to common questions about booking, payments, cancellations and travel.',
};

export default async function FaqsPage() {
  const [faqs, categories] = await Promise.all([
    serverGetSafe<Faq[]>('/faqs', [], 120),
    serverGetSafe<FaqCategory[]>('/faq-categories', [], 300),
  ]);

  return (
    <>
      <PageHero
        title="Frequently asked questions"
        description="Everything you need to know about booking, payments and travelling with us."
        image="/images/banner/faq.jpg"
        crumbs={[{ label: 'FAQs' }]}
      />
      <div className="container-page py-12 sm:py-16">
        <FaqList faqs={faqs} categories={categories} />
      </div>
    </>
  );
}
