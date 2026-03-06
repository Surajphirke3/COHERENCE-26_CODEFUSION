// src/components/ui/input.tsx
'use client';

import React, { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, startIcon, endIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-muted">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border bg-card px-3 transition-all duration-150',
            'focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30',
            error ? 'border-danger' : 'border-border hover:border-border-hover',
          )}
        >
          {startIcon && <span className="text-muted-foreground shrink-0">{startIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground',
              'outline-none disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          />
          {endIcon && <span className="text-muted-foreground shrink-0">{endIcon}</span>}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {!error && helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
