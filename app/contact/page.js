import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Contact ShopLink',
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-jade">Get in touch</p>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
        Questions? Message us <span className="text-marigold">on WhatsApp</span>.
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-ink/70">
        No ticket forms, no waiting on email — the fastest way to reach us is the same way
        your customers will reach you.
      </p>

      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          as="a"
          href="https://wa.me/2348000000000?text=Hi%2C%20I%20have%20a%20question%20about%20ShopLink"
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="lg"
        >
          Chat with us on WhatsApp
        </Button>
        <Button as="a" href="mailto:hello@shoplink.ng" variant="ghost" size="lg">
          Email hello@shoplink.ng
        </Button>
      </div>

      <p className="mt-10 text-sm text-ink/50">
        Prefer to browse first?{' '}
        <Link href="/#how-it-works" className="font-medium text-jade">
          See how ShopLink works
        </Link>
      </p>
    </main>
  );
}