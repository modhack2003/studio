'use client';

import { useState } from 'react';
import { AdminDashboard } from '@/components/admin-dashboard';
import { PinForm } from '@/components/pin-form';
import Link from 'next/link';
import { Terminal } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <header className="absolute top-4 left-4">
        <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
          <Terminal className="h-5 w-5" />
          <span className="font-code text-sm">/home</span>
        </Link>
      </header>
      
      <div className="w-full max-w-4xl">
        {isAuthenticated ? (
          <AdminDashboard />
        ) : (
          <PinForm onSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
}
