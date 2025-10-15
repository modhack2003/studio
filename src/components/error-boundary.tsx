'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import PixelCard from './pixel-card';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <PixelCard className="max-w-2xl w-full">
        <div className="bg-transparent p-8 rounded-sm text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-2xl font-code text-destructive">
              Something went wrong!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                An unexpected error occurred while loading the page.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-4 bg-muted/50 rounded border border-destructive/20">
                  <summary className="cursor-pointer text-sm font-medium text-destructive mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={reset} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact support.
            </p>
          </CardContent>
        </div>
      </PixelCard>
    </div>
  );
}
