'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

// Catches any error thrown while rendering a dashboard page (e.g. a failed
// Supabase query) so a vendor sees a branded, actionable message instead of
// a blank screen or Next.js's default error page.
export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h2 className="mt-4 font-display text-xl text-ink">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-ink/60">
        We couldn&apos;t load this page. Your store and data are fine — this was just a hiccup loading
        it.
      </p>
      <Button type="button" variant="marigold" size="md" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
