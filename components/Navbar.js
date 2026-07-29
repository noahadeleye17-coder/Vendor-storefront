'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Button from './ui/Button';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // /dashboard already has its own auth-aware nav (DashboardNav, with
  // Sign out), and /store/[slug] is a public storefront that isn't
  // trying to sell the viewer on signing up. The "How it works /
  // Contact" marketing links and "Log in / Get started" buttons don't
  // apply on either — but the ShopLink logo/home link stays everywhere.
  const isAppRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/store');

  if (isAppRoute) {
    return (
      <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
          <Link href="/" className="font-display text-xl text-ink">
            Shop<span className="text-marigold">Link</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl text-ink" onClick={() => setOpen(false)}>
          Shop<span className="text-marigold">Link</span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button as={Link} href="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button as={Link} href="/signup" variant="marigold" size="sm">
            Get started
          </Button>
        </div>

        {/* mobile menu toggle */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* mobile menu panel */}
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-paper px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-base font-medium text-ink/80 hover:bg-white/5 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Button as={Link} href="/login" variant="ghost" size="md" onClick={() => setOpen(false)}>
              Log in
            </Button>
            <Button as={Link} href="/signup" variant="marigold" size="md" onClick={() => setOpen(false)}>
              Get started
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}