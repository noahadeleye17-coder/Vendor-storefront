import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, Eye, ExternalLink, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';
import CopyLinkButton from '@/components/CopyLinkButton';
import Button from '@/components/ui/Button';

export default async function DashboardOverviewPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('business_name, slug, whatsapp_number, view_count, is_published')
    .eq('id', user.id)
    .single();

  if (!vendor) {
    redirect('/login');
  }

  const { count: productCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('vendor_id', user.id);

  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/store/${vendor.slug}`;
  const products = productCount ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-jade">
          {vendor.business_name}
        </p>
        {/* Only the business name is real data here — we don't collect a
            personal name anywhere, so this doesn't try to guess one. */}
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-ink/60">Here's what's happening with your store.</p>
      </div>

      {/* storefront link — the thing vendors will actually share */}
      <div className="rounded-2xl border border-line bg-white/[0.03] p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Your storefront link</p>
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-2 break-all font-mono text-sm text-jade underline underline-offset-2"
        >
          {storeUrl}
          <ExternalLink size={14} className="shrink-0" />
        </a>
        <CopyLinkButton url={storeUrl} className="mt-4 w-full justify-center" />
        {!vendor.is_published && (
          <p className="mt-3 text-xs text-marigold">
            Your storefront is currently hidden from customers. This link still works for you as a
            preview — head to Settings to publish when you're ready.
          </p>
        )}
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line p-5">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Products</p>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jade/10 text-jade">
              <Package size={16} />
            </span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{products}</p>
          <p className="mt-1 text-xs text-jade">
            {vendor.is_published ? 'Live and selling' : 'Not published yet'}
          </p>
        </div>

        <div className="rounded-2xl border border-line p-5">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Storefront views</p>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jade/10 text-jade">
              <Eye size={16} />
            </span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-ink">{vendor.view_count ?? 0}</p>
          {/* No fake trend here — we only store a running total, not a
              timestamped history, so there's no honest way to show a real
              "+N this week" yet. */}
          <p className="mt-1 text-xs text-ink/40">All-time</p>
        </div>
      </div>

      {/* grow your catalog */}
      <div className="rounded-2xl border border-line bg-white/[0.03] p-6">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-marigold" />
          <h2 className="font-display text-lg text-ink">Grow your catalog</h2>
        </div>
        <p className="mt-2 text-sm text-ink/60">
          {products === 0
            ? "You haven't added any products yet — your storefront needs at least one to give customers something to order."
            : `You have ${products} product${products === 1 ? '' : 's'} live. More products give customers more reasons to order.`}
        </p>
        <Button as={Link} href="/dashboard/products/new" variant="marigold" size="md" className="mt-4">
          Add a product
        </Button>
      </div>
    </div>
  );
}