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
    .eq('is_published', true)
    .single();

  return { title: vendor ? `${vendor.business_name} — Storefront` : 'Storefront' };
}

export default async function StorefrontPage({ params }) {
  const supabase = createClient();

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, business_name, slug, whatsapp_number, logo_url, theme_color, theme_font, is_published')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!vendor) {
    notFound();
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, photo_url, in_stock')
    .eq('vendor_id', vendor.id)
    .order('sort_order', { ascending: true });

  const theme = getThemePreset(vendor.theme_color);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.bg,
        backgroundImage: `radial-gradient(circle at 80% 0%, ${theme.glow} 0%, transparent 45%)`,
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16">
        <StorefrontHeader vendor={vendor} />

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
          />
        )}
      </div>
    </div>
  );
}