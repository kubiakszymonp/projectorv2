import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline';

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-primary/15 text-primary',
  secondary: 'bg-muted text-muted-foreground',
  outline: 'border border-border text-foreground',
};

export function Badge({
  className,
  variant = 'secondary',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
