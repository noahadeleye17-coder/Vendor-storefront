import Link from 'next/link';
import { Compass } from 'lucide-react';
import Button from '@/components/ui/Button';

// Used whenever notFound() is called (e.g. an unknown /store/[slug], or a
// product id that doesn't exist / isn't the vendor's own) as well as any
// route that doesn't match — replaces Next.js's unstyled default 404.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-jade/10 text-jade">
        <Compass className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-display text-3xl text-ink">Page not found</h1>
      <p className="mt-2 text-ink/60">
        This link may be broken, or the page has moved. Double-check the URL, or head back home.
      </p>
      <Button as={Link} href="/" variant="marigold" size="md" className="mt-6">
        Back to ShopLink
      </Button>
    </main>
  );
}
