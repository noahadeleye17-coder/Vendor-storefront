import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import CopyLinkButton from '@/components/CopyLinkButton';
import Button from '@/components/ui/Button';

export default async function DashboardOverviewPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from('vendors')
    .select('business_name, slug, whatsapp_number, view_count')
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Welcome back, {vendor.business_name}</h1>
        <p className="mt-1 text-ink/60">Here's what's happening with your store.</p>
      </div>

      {/* storefront link — the thing vendors will actually share */}
      <div className="rounded-2xl border border-line bg-white/[0.03] p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Your storefront link</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 break-all font-mono text-sm text-jade underline underline-offset-2"
          >
            {storeUrl}
          </a>
          <CopyLinkButton url={storeUrl} />
        </div>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Products</p>
          <p className="mt-2 font-display text-3xl text-ink">{productCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-line p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Storefront views</p>
          <p className="mt-2 font-display text-3xl text-ink">{vendor.view_count ?? 0}</p>
        </div>
      </div>

      <div>
        <Button as={Link} href="/dashboard/products/new" variant="marigold" size="md">
          Add a product
        </Button>
      </div>
    </div>
  );
}