'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import type { Faq, FaqCategory } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FaqList({ faqs, categories }: { faqs: Faq[]; categories: FaqCategory[] }) {
  const [category, setCategory] = React.useState<string>('all');
  const [query, setQuery] = React.useState('');

  const filtered = faqs.filter((faq) => {
    const matchesCategory = category === 'all' || (faq.categoryIds ?? []).includes(category);
    const matchesQuery =
      !query.trim() ||
      faq.title.toLowerCase().includes(query.toLowerCase()) ||
      faq.content.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-2xl border bg-card p-4">
          <p className="mb-3 text-sm font-semibold">Categories</p>
          <div className="flex flex-wrap gap-2 lg:flex-col">
            <button
              onClick={() => setCategory('all')}
              className={cn(
                'rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                category === 'all' && 'bg-accent font-medium text-primary',
              )}
            >
              All questions
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={cn(
                  'rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                  category === item.id && 'bg-accent font-medium text-primary',
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions…"
            className="h-11 pl-9"
          />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {filtered.length} question{filtered.length === 1 ? '' : 's'}
        </p>

        <Accordion type="single" collapsible className="mt-2">
          {filtered.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.title}</AccordionTrigger>
              <AccordionContent>
                <div dangerouslySetInnerHTML={{ __html: faq.content }} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filtered.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No questions matched. Try a different search or ask us directly.
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/50 p-6">
          <div>
            <p className="font-semibold">Still have a question?</p>
            <p className="mt-1 text-sm text-muted-foreground">Our travel team usually replies within a few hours.</p>
          </div>
          <Button asChild>
            <a href="/contact">Contact us</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
