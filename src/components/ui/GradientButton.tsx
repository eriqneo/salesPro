import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    if (variant === 'primary') {
      return (
        <Button
          ref={ref}
          className={cn(
            "bg-gradient-brand text-white border-none rounded-xl hover:opacity-90 transition-opacity shadow-sm",
            className
          )}
          size={size as any}
          {...props}
        />
      );
    }

    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "bg-white border-primary text-primary rounded-xl hover:bg-primary/5 transition-colors",
          className
        )}
        size={size as any}
        {...props}
      />
    );
  }
);

GradientButton.displayName = 'GradientButton';
