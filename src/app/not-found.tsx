// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center bg-background">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/10 mb-6">
        <MapPinOff className="h-12 w-12 text-accent" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">404</h1>
      <h2 className="text-xl font-semibold tracking-tight text-foreground/90 mb-4">Page not found</h2>
      <p className="max-w-md text-muted-foreground mb-8 text-lg">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or removed.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="secondary" size="lg">
          <button onClick={() => window.history.back()}>Go Back</button>
        </Button>
        <Link href="/">
          <Button variant="primary" size="lg">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
