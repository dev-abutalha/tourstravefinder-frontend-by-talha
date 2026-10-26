import { Suspense } from 'react';
import ReviewPageClient from './review-client';

export const metadata = { title: 'Leave a review' };

export default function SubmitReviewPage() {
  return (
    <Suspense>
      <ReviewPageClient />
    </Suspense>
  );
}
