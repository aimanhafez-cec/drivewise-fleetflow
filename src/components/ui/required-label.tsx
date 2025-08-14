import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RequiredLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  required?: boolean;
  children: React.ReactNode;
}

export const RequiredLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  RequiredLabelProps
>(({ required = false, children, className, ...props }, ref) => {
  return (
    <Label ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
      <span>{children}</span>
      {required && (
        <span 
          className="text-red-500 text-sm" 
          aria-hidden="true"
        >
          *
        </span>
      )}
    </Label>
  );
});

RequiredLabel.displayName = "RequiredLabel";