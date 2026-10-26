import { RealtimeSearch } from '@/components/site/realtime-search';

export function SearchBar({ className }: { className?: string }) {
  return (
    <div data-home-hero-search className={className}>
      <RealtimeSearch
        placeholder="Where do you want to go?"
        buttonLabel="Find tours"
        layout="split"
        controlClassName="bg-background/95 shadow-2xl backdrop-blur"
        dropdownClassName="left-0 right-0 w-full"
      />
    </div>
  );
}
