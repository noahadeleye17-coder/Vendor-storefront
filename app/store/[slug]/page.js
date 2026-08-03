// public-facing storefront rendered by vendor slug
import { notFound } from 'next/navigation';
import clsx from 'clsx';
import { createClient } from '@/lib/supabaseServer';
import StorefrontHeader from '@/components/StorefrontHeader';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { getThemePreset } from '@/lib/themePresets';

export async function generateMetadata({ params }) {
  const supabase = createClient();
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, business_name, logo_url, is_published')
    .eq('slug', params.slug)
    .single();

  if (!vendor) {
    return { title: 'Storefront' };
  }

  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('vendor_id', vendor.id);
  const productCount = count ?? 0;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const storeUrl = `${appUrl}/store/${params.slug}`;

  const title = `${vendor.business_name} — Shop on WhatsApp`;
  const description =
    productCount > 0
      ? `Browse ${productCount} product${productCount === 1 ? '' : 's'} from ${vendor.business_name} and order straight from WhatsApp — no app, no account.`
      : `Order from ${vendor.business_name} straight from WhatsApp — no app, no account.`;

  // Vendor's own logo when they've uploaded one (already a full public
  // Supabase storage URL), otherwise the branded ShopLink fallback card so
  // every store link still previews well before a vendor customizes anything.
  const ogImage = vendor.logo_url || `${appUrl}/images/store-og-default.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: storeUrl,
      siteName: 'ShopLink',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${vendor.business_name} on ShopLink` }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    // Unpublished/preview stores shouldn't be indexed or surfaced in search.
    robots: vendor.is_published ? undefined : { index: false, follow: false },
  };
}

export default async function StorefrontPage({ params }) {
  const supabase = createClient();

  // No `.eq('is_published', true)` filter here — row level security
  // (schema.sql) already handles who can see what: "public can view
  // published vendors" lets anyone read a live store, and "vendor can
  // view own record" separately lets the owner read their own row even
  // while unpublished. If neither policy matches, the query below just
  // returns no row and we 404, same end result as filtering here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, business_name, slug, whatsapp_number, logo_url, theme_color, theme_font, is_published')
    .eq('slug', params.slug)
    .single();

  if (!vendor) {
    notFound();
  }

  const isOwner = user?.id === vendor.id;
  const isPreview = !vendor.is_published;

  // Belt-and-suspenders: RLS already guarantees a stranger's query above
  // returns no row for an unpublished store, but check explicitly too so
  // an owner who's unpublished never sees a "live" page with no warning.
  if (isPreview && !isOwner) {
    notFound();
  }

  // Count real customer visits only — never the owner previewing their
  // own (possibly unpublished) store. Uses a SECURITY DEFINER function
  // (see schema.sql) since anonymous visitors have no RLS-matching
  // session to update the vendors row directly. supabase.rpc() returns
  // a query builder, not a real Promise — it doesn't have .catch(), so
  // this uses try/catch instead. Failure here shouldn't break the page
  // for the visitor, so it's swallowed rather than re-thrown.
  if (!isPreview) {
    try {
      await supabase.rpc('increment_view_count', { vendor_slug: vendor.slug });
    } catch {
      // ignore — a missed view count shouldn't 500 the storefront
    }
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, photo_url, in_stock')
    .eq('vendor_id', vendor.id)
    .order('sort_order', { ascending: true });

  const theme = getThemePreset(vendor.theme_color);

  // Soft counter-glow from the opposite corner, independent of the vendor's
  // accent color, so the gradient reads as a deliberate two-tone effect
  // rather than one flat smudge in a single corner.
  const counterGlow = theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 31, 0.05)';

  // Dot-grid tint, adapted to mode so it's visible but subtle on either a
  // dark or a light page.
  const dotColor = theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 31, 0.07)';
  const isPreviewText = theme.mode === 'light' ? 'text-onLight' : 'text-ink';

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.bg,
        backgroundImage: [
          `radial-gradient(circle at 80% 0%, ${theme.glow} 0%, transparent 50%)`,
          `radial-gradient(circle at 10% 100%, ${counterGlow} 0%, transparent 60%)`,
        ].join(', '),
      }}
    >
      {isPreview && (
        <div className="border-b border-line bg-marigold px-4 py-2 text-center text-sm font-medium text-onMarigold">
          Preview mode — this storefront is hidden from customers until you publish it in Settings.
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className={clsx('font-display', isPreviewText)}>
            Shop<span className="text-marigold">Link</span>
          </span>
          <span className={clsx('font-mono text-xs uppercase tracking-widest', isPreviewText, 'opacity-60')}>
            Powered by ShopLink
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-line">
          {/* Dot-grid texture, confined to the header zone and faded out via
              a mask before it reaches the product grid — adds texture to the
              hero without competing with product photos for attention. */}
          <div className="relative overflow-hidden border-b border-line px-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
                backgroundSize: '18px 18px',
                maskImage: 'linear-gradient(to bottom, black, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
              }}
            />
            <div className="relative">
              <StorefrontHeader vendor={vendor} mode={theme.mode} />
            </div>
          </div>

          <div className="flex flex-col gap-6 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={clsx('font-display text-xl', theme.mode === 'light' ? 'text-onLight' : 'text-ink')}>
                  Catalog
                </h2>
                <p className={clsx('text-sm', theme.mode === 'light' ? 'text-onLight/60' : 'text-ink/50')}>
                  {products?.length ?? 0} item{products?.length === 1 ? '' : 's'} available
                </p>
              </div>
              {vendor.is_published && (
                <span className="rounded-full bg-jade/10 px-3 py-1 font-mono text-xs uppercase tracking-wide text-jade">
                  Open now
                </span>
              )}
            </div>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    whatsappNumber={vendor.whatsapp_number}
                    storeName={vendor.business_name}
                    mode={theme.mode}
                  />
                ))}
              </div>
            ) : productsError ? (
              <EmptyState
                title="Catalog is taking a moment"
                description="We couldn't load the products right now — try refreshing the page."
                mode={theme.mode}
              />
            ) : (
              <EmptyState
                title="No products yet"
                description={`${vendor.business_name} hasn't added any products to this storefront yet. Check back soon.`}
                mode={theme.mode}
              />
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-line px-6 py-8 text-center">
          <h3 className={clsx('font-display text-lg', theme.mode === 'light' ? 'text-onLight' : 'text-ink')}>
            No account needed
          </h3>
          <p className={clsx('mx-auto mt-2 max-w-sm text-sm', theme.mode === 'light' ? 'text-onLight/60' : 'text-ink/60')}>
            Tap any product and WhatsApp opens with your order already written out. Pay and arrange
            delivery directly with the vendor.
          </p>
        </div>

        <p className={clsx('mt-8 text-center text-xs', theme.mode === 'light' ? 'text-onLight/40' : 'text-ink/40')}>
          &copy; {new Date().getFullYear()} {vendor.business_name} · Storefront by ShopLink
        </p>
      </div>
    </div>
  );
}