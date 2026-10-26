'use client';

import * as React from 'react';
import { Loader2, Send } from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export function ContactForm() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setLoading(true);
    setError('');
    try {
      await api('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: String(form.get('name')),
          email: String(form.get('email')),
          subject: String(form.get('subject') || 'New enquiry'),
          message: String(form.get('message')),
          website: String(form.get('website') || ''),
        }),
      });
      setSent(true);
      formEl.reset();
      toast.success('Message sent. We will be in touch soon.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-semibold">Send us a message</h2>
      <p className="mt-1 text-sm text-muted-foreground">Fill in the form and our travel team will reply as soon as possible.</p>

      {sent && (
        <Alert className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-900">
          <AlertDescription>Thank you — your message is on its way. We usually reply within a few hours.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name *</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address *</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" placeholder="Booking, tickets, a specific tour…" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea id="message" name="message" required rows={6} placeholder="Tell us how we can help…" />
        </div>
        <div className="sr-only" aria-hidden="true">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <Button type="submit" className="mt-5" disabled={loading}>
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
        {loading ? 'Sending…' : 'Send message'}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">By sending this form you agree to our privacy policy.</p>
    </form>
  );
}
