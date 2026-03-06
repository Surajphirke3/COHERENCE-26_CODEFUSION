// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('Global error boundary caught an error:', error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 mb-6">
        <AlertCircle className="h-10 w-10 text-danger" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">Something went wrong</h2>
      <p className="max-w-md text-muted-foreground mb-8">
        We encountered an unexpected error. Our team has been notified.
        {error.message && (
          <span className="block mt-2 font-mono text-xs bg-black/40 p-2 rounded text-muted-foreground/80 overflow-auto max-w-full truncate">
            {error.message}
          </span>
        )}
      </p>
      <div className="flex items-center gap-4">
        <Button onClick={() => window.location.reload()} variant="secondary">
          Refresh Page
        </Button>
        <Button onClick={() => reset()} variant="primary">
          Try Again
        </Button>
      </div>
    </div>
  );
}
