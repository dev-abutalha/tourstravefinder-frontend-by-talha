import Link from 'next/link';
import { BadgeCheck, Mail, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Booking confirmed' };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string; currency?: string }>;
}) {
  const sp = await searchParams;
  const order = sp.order ?? '';

  return (
    <div className="container-page flex flex-col items-center py-20 text-center sm:py-28">
      <span className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <BadgeCheck className="size-8" />
      </span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Booking received</p>
      <h1 className="mt-3 text-3xl font-semibold text-balance sm:text-4xl">Thank you — your adventure is booked</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        We have received your booking and sent a confirmation to your email address. Our team will confirm availability with our partner and send your tickets shortly.
      </p>

      {order && (
        <div className="mt-7 rounded-2xl border bg-card px-8 py-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Booking reference</p>
          <p className="mt-1 text-2xl font-semibold tracking-wide">{order}</p>
          {sp.total && (
            <p className="mt-1 text-sm text-muted-foreground">
              Total {new Intl.NumberFormat('en-IE', { style: 'currency', currency: sp.currency || 'EUR' }).format(Number(sp.total))}
            </p>
          )}
        </div>
      )}

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={order ? `/order-tracker?order=${encodeURIComponent(order)}` : '/order-tracker'}>
            <Ticket className="mr-1.5 size-4" /> Track booking
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/account">Go to my account</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/products">Keep exploring</Link>
        </Button>
      </div>

      <p className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Mail className="size-3.5" /> Did not receive the email? Check your spam folder or contact support.
      </p>
    </div>
  );
}
