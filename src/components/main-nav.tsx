'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'About', href: '#about', jp: '自己' },
  { name: 'Work', href: '#experience', jp: '経歴' },
  { name: 'Projects', href: '#projects', jp: '作品' },
  { name: 'CTF', href: '#ctf', jp: '旗' },
  { name: 'Skills', href: '#skills', jp: '武器' },
  { name: 'VAPT', href: '#vapt', jp: '侵入' },
  { name: 'Bounty', href: '#bounty', jp: '賞金' },
  { name: 'Blog', href: '#blog', jp: '記録' },
  { name: 'Contact', href: '#contact', jp: '通信' },
  { name: 'Admin', href: '/b1kr4m-5h4d0w', jp: '管理' },
];

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], ''];
  return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
}

export function MainNav({
  name = 'Bikram Dey',
  hidden = [],
  solid = false,
}: {
  name?: string;
  /** section anchors that have no content right now, e.g. ['#experience', '#ctf'] */
  hidden?: string[];
  /** inner pages (e.g. /blog): always use the dark bar and link back to the home page sections */
  solid?: boolean;
}) {
  const navItems = NAV_ITEMS.filter((i) => !hidden.includes(i.href)).map((i) =>
    solid && i.href.startsWith('#') ? { ...i, href: `/${i.href}` } : i
  );
  // with many sections the desktop nav needs more room: switch breakpoints up one step
  const dense = navItems.filter((i) => i.href.includes('#')).length > 7;
  const [scrolled, setIsScrolled] = useState(false);
  const isScrolled = solid || scrolled;
  const [open, setOpen] = useState(false);
  const [clock, setClock] = useState('');
  const [first, last] = splitName(name);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const tick = () =>
      setClock(new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearInterval(id);
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        isScrolled ? 'bg-ink/90 backdrop-blur-md' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-stretch px-3 sm:px-5">
        {/* notched logo tab */}
        <Link
          href="/"
          className="group relative flex items-center bg-ink pl-4 pr-10 font-display text-lg font-bold uppercase tracking-tight sm:text-xl"
          style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 28px) 100%, 0 100%)' }}
        >
          <span className="text-signal">{first}</span>
          {last && <span className="text-outline-red ml-1 transition-colors group-hover:text-signal">{last}</span>}
        </Link>

        {/* coordinates bar */}
        <div
          className={cn(
            'hidden flex-1 items-center justify-between border-b px-6 monofont text-[10px] uppercase tracking-[0.3em]',
            dense ? '2xl:flex' : 'xl:flex',
            isScrolled ? 'border-signal/40 text-bone/70' : 'border-ink/60 text-ink'
          )}
        >
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 animate-blink bg-current" />secure_uplink // online</span>
          <span className="tabular-nums">IST {clock}</span>
        </div>

        {/* desktop nav */}
        <nav
          className={cn(
            'ml-auto hidden items-center gap-0.5 border-b pl-4',
            dense ? 'xl:flex' : 'lg:flex',
            isScrolled ? 'border-signal/40' : 'border-ink/60'
          )}
        >
          {navItems.slice(0, -1).map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative overflow-hidden px-2.5 py-2 monofont text-[11px] uppercase tracking-[0.18em] transition-colors',
                isScrolled ? 'text-bone/80 hover:text-ink' : 'text-ink hover:text-signal'
              )}
            >
              <span
                className={cn(
                  'absolute inset-0 -z-0 origin-bottom scale-y-0 transition-transform duration-300 group-hover:scale-y-100',
                  isScrolled ? 'bg-signal' : 'bg-ink'
                )}
              />
              <span className="relative z-10">
                <span className="opacity-50">0{i + 1}.</span>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* mobile */}
        <div className={cn('ml-auto flex items-center', dense ? 'xl:hidden' : 'lg:hidden')}>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="bracket flex h-10 w-10 items-center justify-center bg-ink text-signal"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm border-l border-signal bg-signal p-0 text-ink [&>button]:hidden">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center justify-between border-b border-ink/40 px-6 monofont text-[10px] uppercase tracking-[0.3em]">
                <span>{'// NAV_INDEX'}</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="bracket p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto">
                {navItems.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline justify-between border-b border-ink/30 px-6 py-4 transition-colors hover:bg-ink hover:text-signal"
                  >
                    <span className="font-display text-3xl font-bold uppercase">
                      <span className="mr-3 monofont text-xs opacity-60">0{i + 1}</span>
                      {item.name}
                    </span>
                    <span className="font-jp text-sm opacity-70">{item.jp}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
