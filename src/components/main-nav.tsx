'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal } from 'lucide-react';

import { cn } from '@/lib/utils';

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Skills', href: '#skills' },
  { name: 'Contact', href: '#contact' },
  { name: 'Admin', href: '/admin' },
];

export function MainNav() {
  const [isScrolled, setIsScrolled] = useState(false);

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
        'sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300',
        isScrolled ? 'border-primary/20 bg-background/80 backdrop-blur-sm' : ''
      )}
    >
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Terminal className="h-6 w-6 text-primary glitch" data-text="B>" />
          <span className="font-bold text-glow">Bikram's Cyber Fortress</span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
