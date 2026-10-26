'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col gap-4',
        month: 'space-y-4',
        month_caption: 'relative flex h-10 items-center justify-center',
        caption_label: 'text-sm font-semibold',
        nav: 'absolute inset-x-0 top-0 z-10 flex h-10 items-center justify-between',
        button_previous: cn(buttonVariants({ variant: 'outline' }), 'size-8 rounded-full bg-transparent p-0 opacity-70 hover:opacity-100'),
        button_next: cn(buttonVariants({ variant: 'outline' }), 'size-8 rounded-full bg-transparent p-0 opacity-70 hover:opacity-100'),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-10 text-muted-foreground rounded-md font-normal text-[0.8rem]',
        week: 'flex w-full mt-1',
        day: 'size-10 text-center text-sm p-0 relative rounded-md',
        day_button: 'size-10 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected: '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground',
        today: '[&>button]:bg-accent [&>button]:text-accent-foreground',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-40',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === 'left' ? <ChevronLeft className="size-4" {...chevronProps} /> : <ChevronRight className="size-4" {...chevronProps} />,
      }}
      {...props}
    />
  );
}

export { Calendar };
