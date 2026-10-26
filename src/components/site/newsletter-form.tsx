'use client';

import * as React from 'react';
import { api, errorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      toast.success('You are subscribed. Welcome aboard!');
      setEmail('');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex w-full max-w-md items-center gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="h-9 border-white/20 bg-white/10 text-white placeholder:text-white/45"
        />
        <Button type="submit" disabled={loading} className="h-9 rounded-full px-4">
          {loading ? 'Joining…' : 'Subscribe'}
        </Button>
      </div>
    </form>
  );
}
