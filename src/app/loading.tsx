// src/app/loading.tsx
import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Chronos...</p>
      </div>
    </div>
  );
}
