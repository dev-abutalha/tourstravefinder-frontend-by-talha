'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-semibold">We hit an unexpected snag</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Please try again. If the problem continues, our team is only a message away.
      </p>
      <div className="mt-7 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/contact">Contact support</a>
        </Button>
      </div>
    </div>
  );
}
