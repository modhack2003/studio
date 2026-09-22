import * as React from 'react';
import { cn } from '@/lib/utils';

const CardShell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-sm border border-border bg-card text-card-foreground transition-colors duration-300 hover:border-primary/40',
      className
    )}
    {...props}
  />
));
CardShell.displayName = 'CardShell';

export { CardShell };
