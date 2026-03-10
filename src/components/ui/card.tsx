import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'group relative rounded-2xl border border-border/60 bg-card/55 text-card-foreground shadow-[0_10px_26px_-18px_rgba(0,0,0,0.5)] ring-1 ring-border/25 max-w-full overflow-hidden supports-[backdrop-filter]:backdrop-blur-md',
        'transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/25 hover:shadow-[0_16px_30px_-20px_rgba(249,115,22,0.36)] motion-reduce:transform-none',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/8 before:to-transparent before:opacity-25 dark:before:from-white/5',
        'after:pointer-events-none after:absolute after:left-6 after:right-6 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/45 after:to-transparent',
        className
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-4 z-[2] h-2 w-2 rounded-full bg-primary/80 opacity-70 shadow-[0_0_14px_rgba(249,115,22,0.72)] transition-opacity duration-200 group-hover:opacity-100"
      />
    </div>
  )
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight text-foreground', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'text-sm text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
