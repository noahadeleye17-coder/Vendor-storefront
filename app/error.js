'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

// Root-level error boundary — catches anything thrown outside the
// dashboard segment (landing page, storefront, login/signup) that isn't
// already handled by its own error.js.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-display text-3xl text-ink">Something went wrong</h1>
      <p className="mt-2 text-ink/60">
        That was unexpected on our end. Give it another try, or head back home.
      </p>
      <Button type="button" variant="marigold" size="md" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
