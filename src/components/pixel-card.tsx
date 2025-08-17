'use client';

import { cn } from '@/lib/utils';
import React from 'react';

const variants = {
  default: 'border-primary/50 text-primary-foreground',
  pink: 'border-pink-500/50 text-pink-300',
  cyan: 'border-cyan-500/50 text-cyan-300',
  green: 'border-green-500/50 text-green-300',
};

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  as?: React.ElementType;
}

const PixelCard = React.forwardRef<HTMLDivElement, PixelCardProps>(
  ({ className, variant = 'default', as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'relative bg-card/50 p-1',
          'before:absolute before:inset-0 before:-z-10 before:bg-repeat before:[background-size:1rem_1rem]',
          'before:[background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)]',
          'before:animate-pulse',
          className
        )}
        {...props}
      />
    );
  }
);
PixelCard.displayName = 'PixelCard';

export { PixelCard };
