'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  as?: React.ElementType;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  className,
  as: Component = 'h1',
}) => {
  return (
    <Component
      className={cn(
        'overflow-hidden whitespace-nowrap border-r-4 border-r-primary pr-2 font-code text-primary',
        'animate-typing',
        className
      )}
    >
      {text}
    </Component>
  );
};
