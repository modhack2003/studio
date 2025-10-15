'use client';

import { Skeleton } from '@/components/ui/skeleton';
import PixelCard from './pixel-card';

export function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="hidden md:flex space-x-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-6 md:hidden" />
        </div>
      </div>

      <main className="flex-1">
        {/* Hero Section Skeleton */}
        <section className="relative h-[70vh] min-h-[400px] flex items-center justify-center text-center px-4">
          <div className="container z-10 space-y-4">
            <Skeleton className="h-16 w-96 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>
        </section>

        <div className="container mx-auto px-4 py-16 sm:py-24 space-y-24">
          {/* About Section Skeleton */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2">
                <PixelCard>
                  <div className="bg-transparent p-6 rounded-sm h-96">
                    <Skeleton className="w-full h-full" />
                  </div>
                </PixelCard>
              </div>
              <div className="space-y-6">
                <PixelCard>
                  <div className="bg-transparent p-6 rounded-sm">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </PixelCard>
                <PixelCard>
                  <div className="bg-transparent p-6 rounded-sm">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </PixelCard>
              </div>
            </div>
          </section>

          {/* Projects Section Skeleton */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-40 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <PixelCard key={i}>
                  <div className="bg-transparent p-6 rounded-sm h-64">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-14" />
                      </div>
                    </div>
                  </div>
                </PixelCard>
              ))}
            </div>
          </section>

          {/* Skills Section Skeleton */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <PixelCard key={i}>
                  <div className="bg-transparent p-6 rounded-sm h-64">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-32" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <Skeleton key={j} className="h-6 w-20" />
                        ))}
                      </div>
                    </div>
                  </div>
                </PixelCard>
              ))}
            </div>
          </section>

          {/* Contact Section Skeleton */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <PixelCard>
                <div className="bg-transparent p-6 rounded-sm h-96">
                  <Skeleton className="w-full h-full" />
                </div>
              </PixelCard>
              <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
