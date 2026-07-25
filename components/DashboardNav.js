'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
        <div>
          <p className="font-display text-lg text-ink">{businessName}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      <nav className="mx-auto flex max-w-5xl gap-6 px-6">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                active
                  ? 'border-jade text-ink'
                  : 'border-transparent text-ink/50 hover:text-ink'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}