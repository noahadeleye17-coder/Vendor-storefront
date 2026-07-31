// public-facing storefront rendered by vendor slug
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import StorefrontHeader from '@/components/StorefrontHeader';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { getThemePreset } from '@/lib/themePresets';

export async function generateMetadata({ params }) {
  const supabase = createClient();
  const { data: vendor } = await supabase
    .from('vendors')
    .select('business_name')
    .eq('slug', params.slug)
    .single();

  return { title: vendor ? `${vendor.business_name} — Storefront` : 'Storefront' };
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

  const { data: products } = await supabase
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

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16">
        {/* Dot-grid texture, confined to the header zone and faded out via
            a mask before it reaches the product grid — adds texture to the
            hero without competing with product photos for attention. */}
        <div className="relative overflow-hidden">
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

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsappNumber={vendor.whatsapp_number}
                storeName={vendor.business_name}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No products yet"
            description={`${vendor.business_name} hasn't added any products to this storefront yet. Check back soon.`}
            mode={theme.mode}
          />
        )}
      </div>
    </div>
  );
}