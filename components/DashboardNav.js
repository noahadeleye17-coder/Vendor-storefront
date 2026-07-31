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
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-marigold to-[#d85a30] text-onMarigold shadow-card">
            <ShoppingBag size={20} />
          </span>
          <span className="font-display text-lg text-ink">
            Shop<span className="text-marigold">Link</span>
          </span>
        </Link>
        <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-4">
        <nav className="inline-flex gap-1 rounded-2xl border border-line bg-white/[0.03] p-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-white/10 text-ink' : 'text-ink/50 hover:text-ink'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}