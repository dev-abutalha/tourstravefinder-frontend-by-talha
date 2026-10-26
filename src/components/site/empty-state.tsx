import { Compass } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent text-primary">
        <Compass className="size-6" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
