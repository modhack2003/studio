'use client';

import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { DeadEndPinForm } from '@/components/dead-end-pin-form';

/** Decoy login — it never grants access and ships none of the real admin code. */
export default function AdminPage() {
  return (
    <div className="grid-cross flex min-h-screen flex-col items-center justify-center p-4 pt-20 sm:p-8 sm:pt-20 md:p-12 md:pt-24">
      <header className="absolute top-4 left-4">
        <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
          <Terminal className="h-5 w-5" />
          <span className="font-code text-sm">/home</span>
        </Link>
      </header>

      <div className="w-full max-w-4xl">
        <DeadEndPinForm onSuccess={() => {}} />
      </div>
    </div>
  );
}
