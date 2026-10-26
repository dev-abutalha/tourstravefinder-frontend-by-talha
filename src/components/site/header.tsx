'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Compass,
  Globe2,
  Mail,
  Map,
  MapPin,
  Menu,
  Newspaper,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RealtimeSearch } from '@/components/site/realtime-search';
import { useCart } from '@/components/cart-provider';
import { useAuth } from '@/components/auth-provider';
import { cn } from '@/lib/utils';
import { mediaUrl } from '@/lib/media';
import type { MenuData, MenuItem, MenuSection } from '@/lib/types';

type MenuKey = 'places' | 'things' | 'blog';

const FALLBACK_MENU: MenuData = {
  places: {
    label: 'Places to see',
    href: '/destinations',
    items: [{ id: 'top-attractions', name: 'Top attractions', href: '/attractions' }],
    children: {},
  },
  things: {
    label: 'Things to do',
    href: '/products',
    items: [{ id: 'all-experiences', name: 'All experiences', href: '/products' }],
    children: {},
  },
  blog: {
    label: 'Travel guide',
    href: '/blog',
    items: [{ id: 'travel-blog', name: 'Travel blog', href: '/blog' }],
    children: {},
  },
};

const SECTION_CONFIG = {
  places: { icon: Map, href: '/destinations' },
  things: { icon: Globe2, href: '/products' },
  blog: { icon: Newspaper, href: '/blog' },
} satisfies Record<MenuKey, { icon: typeof Map; href: string }>;

function firstItemId(section: MenuSection) {
  return section.items[0]?.id ?? '';
}

function menuItemCountLabel(item: MenuItem, key: MenuKey) {
  if (!item.count) return '';
  return key === 'blog' ? `${item.count} ${item.count === 1 ? 'story' : 'stories'}` : `${item.count} ${item.count === 1 ? 'tour' : 'tours'}`;
}

interface HeaderProps {
  siteName?: string;
  phone?: string;
  email?: string;
  menu?: MenuData;
}

export function Header({
  siteName = 'Tours & Travel',
  phone = '+34 600 123 456',
  email = 'hello@tourstravel.example',
  menu,
}: HeaderProps) {
  const pathname = usePathname();
  const { cart } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [heroSearchVisible, setHeroSearchVisible] = React.useState(pathname === '/');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<MenuKey | null>(null);
  const [mobileSection, setMobileSection] = React.useState<MenuKey | null>(null);
  const headerRef = React.useRef<HTMLElement>(null);
  const openTimer = React.useRef<number | null>(null);
  const closeTimer = React.useRef<number | null>(null);

  const sections: Record<MenuKey, MenuSection> = {
    places: menu?.places?.items?.length ? menu.places : FALLBACK_MENU.places,
    things: menu?.things?.items?.length ? menu.things : FALLBACK_MENU.things,
    blog: menu?.blog?.items?.length ? menu.blog : FALLBACK_MENU.blog,
  };
  const hideHeaderSearch = pathname === '/' && heroSearchVisible;

  const [activeParents, setActiveParents] = React.useState<Record<MenuKey, string>>({
    places: firstItemId(sections.places),
    things: firstItemId(sections.things),
    blog: firstItemId(sections.blog),
  });
  const [mobileParents, setMobileParents] = React.useState<Record<MenuKey, string>>({
    places: firstItemId(sections.places),
    things: firstItemId(sections.things),
    blog: firstItemId(sections.blog),
  });

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    if (pathname !== '/') {
      setHeroSearchVisible(false);
      return;
    }

    setHeroSearchVisible(true);
    const target = document.querySelector('[data-home-hero-search]');
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroSearchVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  React.useEffect(() => {
    if (hideHeaderSearch) setSearchOpen(false);
  }, [hideHeaderSearch]);

  React.useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  React.useEffect(() => {
    const clearTimers = () => {
      if (openTimer.current) window.clearTimeout(openTimer.current);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimers();
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function cancelClose() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleOpen(key: MenuKey) {
    cancelClose();
    if (openMenu === key) return;
    if (openTimer.current) window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      setOpenMenu(key);
      openTimer.current = null;
    }, 110);
  }

  function scheduleClose() {
    if (openTimer.current) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setOpenMenu(null);
      closeTimer.current = null;
    }, 240);
  }

  function toggleMenu(key: MenuKey) {
    cancelClose();
    setOpenMenu((current) => (current === key ? null : key));
  }

  function toggleMobileSection(key: MenuKey) {
    if (mobileSection === key) {
      setMobileSection(null);
      return;
    }
    setMobileSection(key);
    setMobileParents((current) =>
      current[key] ? current : { ...current, [key]: firstItemId(sections[key]) },
    );
  }

  const itemCount = cart?.items.reduce((sum, item) => sum + item.travelerCount, 0) ?? 0;
  const openSection = openMenu ? sections[openMenu] : null;
  const activeParentId = openMenu ? activeParents[openMenu] || firstItemId(sections[openMenu]) : '';
  const activeParent = openSection?.items.find((item) => item.id === activeParentId) ?? openSection?.items[0];
  const activeChildren = openSection ? openSection.children[activeParent?.id ?? ''] ?? [] : [];

  return (
    <header ref={headerRef} className="sticky top-0 z-40 w-full">
      <div className="hidden bg-navy text-white/80 md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5" /> {phone}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" /> {email}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Free cancellation on selected tours</span>
            <span className="h-3 w-px bg-white/20" />
            <Link href="/order-tracker" className="hover:text-white">
              Track your booking
            </Link>
          </div>
        </div>
      </div>

      <div className={cn('relative border-b bg-background/95 backdrop-blur transition-shadow', scrolled && 'shadow-sm')}>
        <div className="container-page flex h-16 items-center gap-3 lg:h-[74px]">
          <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpenMenu(null)}>
            <img src="/images/logo.webp" alt={siteName} className="h-9 w-auto" />
            <span className="sr-only">{siteName}</span>
          </Link>

          {!hideHeaderSearch && (
            <RealtimeSearch
              className="ml-2 hidden max-w-[230px] xl:block"
              compact
              placeholder="Search tours, destinations…"
              controlClassName="border bg-muted/40"
            />
          )}

          <nav className="ml-auto hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {(Object.keys(sections) as MenuKey[]).map((key) => {
              const section = sections[key];
              const Icon = SECTION_CONFIG[key].icon;
              const expanded = openMenu === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={expanded}
                  className={cn(
                    'relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-primary',
                    expanded && 'text-primary',
                  )}
                  onMouseEnter={() => scheduleOpen(key)}
                  onMouseLeave={scheduleClose}
                  onFocus={() => scheduleOpen(key)}
                  onClick={() => toggleMenu(key)}
                >
                  <Icon className="size-4 text-primary" />
                  {section.label}
                  <ChevronDown className={cn('size-3.5 transition-transform', expanded && 'rotate-180')} />
                  <span
                    className={cn(
                      'absolute inset-x-3 -bottom-[1px] h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform',
                      expanded && 'scale-x-100',
                    )}
                  />
                </button>
              );
            })}
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
              onClick={() => setOpenMenu(null)}
            >
              <Compass className="size-4 text-primary" />
              Guided tours
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            {!hideHeaderSearch && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                aria-expanded={searchOpen}
                className="xl:hidden"
                onClick={() => {
                  setSearchOpen((value) => !value);
                  setOpenMenu(null);
                }}
              >
                {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
              <Link href={user ? '/account' : '/account?login=1'} aria-label={user ? 'My account' : 'Sign in'}>
                <User className="size-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart" aria-label="Cart">
                <ShoppingBag className="size-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button asChild className="ml-2 hidden rounded-full px-5 md:inline-flex">
              <Link href="/products">Book now</Link>
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[92vw] gap-0 p-0 sm:max-w-md">
                <SheetTitle className="sr-only">Main menu</SheetTitle>
                <div className="border-b px-5 py-4 pr-12">
                  <Link href="/" onClick={() => setMobileOpen(false)} className="inline-flex items-center">
                    <img src="/images/logo.webp" alt={siteName} className="h-8 w-auto" />
                  </Link>
                </div>

                <div className="border-b bg-muted/40 p-3">
                  <RealtimeSearch
                    compact
                    placeholder="Search tours, destinations…"
                    controlClassName="border bg-background"
                    dropdownClassName="left-0 right-0 w-full"
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2">
                  {(Object.keys(sections) as MenuKey[]).map((key) => {
                    const section = sections[key];
                    const Icon = SECTION_CONFIG[key].icon;
                    const expanded = mobileSection === key;
                    return (
                      <div key={key} className="border-b py-1 last:border-0">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-3 text-left text-sm font-semibold hover:bg-muted"
                          aria-expanded={expanded}
                          onClick={() => toggleMobileSection(key)}
                        >
                          <Icon className="size-5 text-primary" />
                          <span>{section.label}</span>
                          <ChevronDown className={cn('ml-auto size-4 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
                        </button>

                        {expanded && (
                          <div className="pb-2">
                            {section.items.map((item) => {
                              const children = section.children[item.id] ?? [];
                              const parentExpanded = mobileParents[key] === item.id;
                              return (
                                <div key={item.id} className="rounded-lg">
                                  <div className="flex items-center">
                                    <Link
                                      href={item.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                                    >
                                      <span className="truncate">{item.name}</span>
                                      {item.count ? (
                                        <span className="shrink-0 text-[11px] text-muted-foreground">
                                          {menuItemCountLabel(item, key)}
                                        </span>
                                      ) : null}
                                    </Link>
                                    {children.length > 0 && (
                                      <button
                                        type="button"
                                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        aria-label={`Show ${item.name} submenu`}
                                        aria-expanded={parentExpanded}
                                        onClick={() =>
                                          setMobileParents((current) => ({
                                            ...current,
                                            [key]: current[key] === item.id ? '' : item.id,
                                          }))
                                        }
                                      >
                                        <ChevronRight className={cn('size-4 transition-transform', parentExpanded && 'rotate-90')} />
                                      </button>
                                    )}
                                  </div>
                                  {children.length > 0 && parentExpanded && (
                                    <div className="ml-4 border-l pl-2">
                                      {children.map((child) => (
                                        <Link
                                          key={child.id}
                                          href={child.href}
                                          onClick={() => setMobileOpen(false)}
                                          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                        >
                                          <span className="line-clamp-2">{child.name}</span>
                                          {child.count ? (
                                            <span className="shrink-0 text-[10px]">{child.count}</span>
                                          ) : null}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Link
                    href="/products"
                    onClick={() => setMobileOpen(false)}
                    className="mt-1 flex items-center gap-2.5 rounded-lg px-2 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    <Compass className="size-5 text-primary" />
                    Guided tours
                  </Link>
                </div>

                <div className="grid gap-2 border-t p-4">
                  <Button variant="outline" asChild>
                    <Link href="/order-tracker" onClick={() => setMobileOpen(false)}>
                      Track booking
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={user ? '/account' : '/account?login=1'} onClick={() => setMobileOpen(false)}>
                      {user ? 'My account' : 'Sign in'}
                    </Link>
                  </Button>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p className="inline-flex items-center gap-2">
                      <Phone className="size-3.5" /> {phone}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2">
                      <Mail className="size-3.5" /> {email}
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {searchOpen && !hideHeaderSearch && (
          <div className="border-t bg-background">
            <div className="container-page py-3">
              <RealtimeSearch
                autoFocus
                placeholder="Search tours, destinations, tickets…"
                buttonLabel="Search"
                dropdownClassName="left-0 right-0 w-full sm:w-[430px]"
                onNavigate={() => setSearchOpen(false)}
              />
            </div>
          </div>
        )}

        {openSection && openMenu && (
          <div
            className="absolute inset-x-0 top-full z-50 animate-in border-t bg-background shadow-xl fade-in-0 slide-in-from-top-1 duration-150"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onClick={() => setOpenMenu(null)}
            role="region"
            aria-label={`${openSection.label} menu`}
          >
            <div className="container-page py-5">
              <div className="flex min-h-[330px] gap-7">
                <aside className="w-60 shrink-0 border-r pr-5">
                  <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {openSection.label}
                  </p>
                  <div className="space-y-0.5">
                    {openSection.items.map((item) => {
                      const selected = item.id === activeParent?.id;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onMouseEnter={() => setActiveParents((current) => ({ ...current, [openMenu]: item.id }))}
                          className={cn(
                            'flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors',
                            selected ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground/75 hover:bg-muted hover:text-foreground',
                          )}
                        >
                          <span className="truncate">{item.name}</span>
                          {item.count ? (
                            <span className={cn('shrink-0 text-[10px]', selected ? 'text-primary/70' : 'text-muted-foreground')}>
                              {item.count}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </aside>

                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center justify-between gap-4 px-1">
                    <p className="text-sm font-semibold">{activeParent?.name ?? openSection.label}</p>
                    <Link href={activeParent?.href ?? openSection.href} className="text-xs font-semibold text-primary hover:underline">
                      View all
                    </Link>
                  </div>

                  {activeChildren.length > 0 ? (
                    <div
                      className={cn(
                        'grid gap-x-3 gap-y-0.5 sm:grid-cols-2',
                        openMenu === 'things' ? 'xl:grid-cols-2' : 'xl:grid-cols-3',
                      )}
                    >
                      {activeChildren.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="group flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
                        >
                          {item.image ? (
                            <img
                              src={mediaUrl(item.image)}
                              alt=""
                              loading="lazy"
                              className="size-9 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <MapPin className="size-4" />
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium leading-snug group-hover:text-primary">{item.name}</span>
                            {item.count ? (
                              <span className="block truncate text-[11px] text-muted-foreground">
                                {menuItemCountLabel(item, openMenu)}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                      Browse all {openSection.label.toLowerCase()} in this collection.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
