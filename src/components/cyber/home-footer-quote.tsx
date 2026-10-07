'use client';

import { usePathname } from 'next/navigation';
import { RotatingQuote } from './rotating-quote';

export function HomeFooterQuote() {
  const pathname = usePathname();
  if (pathname !== '/') return null;
  return <div className="mb-8 mt-10 max-w-4xl sm:mt-12"><RotatingQuote large label="One last thought" /></div>;
}
