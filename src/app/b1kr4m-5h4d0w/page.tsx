'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CryptoPuzzle } from '@/components/crypto-puzzle';
import Link from 'next/link';
import { Terminal, Lock } from 'lucide-react';

export default function BikramShadowAccessPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handlePuzzleSuccess = () => {
    setIsAuthenticated(true);
    // Redirect to bikram page for PIN authentication after puzzle completion
    router.push('/bikram');
  };

  if (isAuthenticated) {
    return null; // Will redirect to /bikram
  }

  return (
    <div className="grid-cross flex min-h-screen flex-col items-center justify-center p-4 pt-20 sm:p-8 md:p-12 bg-gradient-to-br from-background via-background to-primary/10">
      <header className="absolute top-4 left-4">
        <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
          <Terminal className="h-5 w-5" />
          <span className="font-code text-sm">/home</span>
        </Link>
      </header>
      
      <div className="w-full max-w-4xl">
        <CryptoPuzzle onSuccess={handlePuzzleSuccess} />
      </div>
      
      <footer className="absolute bottom-4 right-4 text-xs text-muted-foreground/50 font-mono">
        <div className="flex items-center gap-2">
          <Lock className="h-3 w-3" />
          <span>b1kr4m-5h4d0w</span>
        </div>
      </footer>
    </div>
  );
}


