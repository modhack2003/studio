'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { PersonalIcon } from '@/components/personal-icon';

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'CTF', href: '#ctf' },
  { name: 'Skills', href: '#skills' },
  { name: 'Blog', href: '#blog' },
  { name: 'Contact', href: '#contact' },
  { name: 'Admin', href: '/b1kr4m-5h4d0w' },
];

export function MainNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        isScrolled
          ? 'border-border bg-background/90 backdrop-blur-sm'
          : 'border-transparent bg-background/70'
      )}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 text-base font-semibold tracking-tight"
        >
          <PersonalIcon className="h-5 w-5 text-primary transition-colors group-hover:text-foreground" />
          <span className="hidden sm:inline">Menu</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-8 text-sm font-medium md:flex">
          {navItems.slice(0, -1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-1 text-muted-foreground transition-colors hover:text-primary"
            >
              {item.name}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-primary/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] border-border bg-background p-6 text-base">
              <SheetHeader className="mb-8">
                <Link
                  href="/"
                  className="text-lg font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Menu
                </Link>
              </SheetHeader>
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
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
