'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Button from './ui/Button';

const TABS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/products', label: 'Products' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function DashboardNav({ businessName }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-marigold text-onMarigold">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <p className="font-display text-lg text-ink">
            Shop<span className="text-marigold">Link</span>
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      <nav className="mx-auto flex max-w-5xl px-6 pb-4">
        <div className="inline-flex gap-1 rounded-full border border-line p-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-ink text-paper' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}