'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';

export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <Carousel opts={{ align: 'start', loop: products.length > 4 }} className="px-0">
      <CarouselContent>
        {products.map((product) => (
          <CarouselItem key={product.id} className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-3 hidden border bg-background shadow-md sm:flex" />
      <CarouselNext className="-right-3 hidden border bg-background shadow-md sm:flex" />
    </Carousel>
  );
}
