'use client';

import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, Star } from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHero } from '@/components/site/page-hero';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ReviewPage() {
  const params = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const token = params.token || searchParams.get('token') || '';
  const [rating, setRating] = React.useState(5);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError('');
    try {
      await api('/reviews/submit', {
        method: 'POST',
        body: JSON.stringify({
          token,
          rating,
          title: String(form.get('title') || ''),
          content: String(form.get('content')),
          authorName: String(form.get('authorName') || ''),
          authorEmail: String(form.get('authorEmail') || '') || undefined,
        }),
      });
      setSubmitted(true);
      toast.success('Thank you for your review');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero
        title="How was your experience?"
        description="Your feedback helps other travellers and helps us improve."
        image="/images/banner/about-us-3.webp"
        crumbs={[{ label: 'Leave a review' }]}
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-xl rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          {submitted ? (
            <div className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Star className="size-7 fill-current" />
              </span>
              <h2 className="mt-4 text-xl font-semibold">Thank you for sharing</h2>
              <p className="mt-2 text-sm text-muted-foreground">Your review has been submitted and will help future travellers.</p>
              <Button asChild className="mt-5">
                <a href="/products">Explore more experiences</a>
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <p className="mb-2 text-sm font-medium">Your rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`}>
                      <Star className={cn('size-8 transition-colors', value <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted')} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="authorName">Your name</Label>
                  <Input id="authorName" name="authorName" placeholder="How should we show your name?" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="authorEmail">Email (private)</Label>
                  <Input id="authorEmail" name="authorEmail" type="email" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Review title</Label>
                <Input id="title" name="title" placeholder="Summarise your experience" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="content">Your review *</Label>
                <Textarea id="content" name="content" required minLength={10} rows={6} placeholder="What did you enjoy? What should other travellers know?" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {loading ? 'Submitting…' : 'Submit review'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
