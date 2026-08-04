'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { supabase } from '@/lib/supabaseClient';
import { getThemePreset } from '@/lib/themePresets';
import StorefrontHeader from './StorefrontHeader';
import ProductCard from './ProductCard';

// Live-updating preview of the vendor's storefront, shown next to the
// settings form. Reuses StorefrontHeader/ProductCard directly (rather than
// re-implementing their markup) so the preview can never drift out of sync
// with what customers actually see on /store/[slug] — any future change to
// those components shows up here automatically.
//
// `vendor` is the *draft* form state (business name, logo, theme, etc.),
// not the saved DB row, so edits reflect instantly before Save is pressed.
// Products, on the other hand, aren't part of the settings form — those are
// fetched once for the real, already-saved catalog.
export default function StorefrontPreview({ vendorId, vendor, storeUrl }) {
  const [products, setProducts] = useState(null); // null = still loading

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, photo_url, in_stock')
        .eq('vendor_id', vendorId)
        .order('sort_order', { ascending: true })
        .limit(4);

      if (!cancelled) setProducts(data || []);
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  const theme = getThemePreset(vendor.theme_color);
  const isLight = theme.mode === 'light';
  const counterGlow = isLight ? 'rgba(15, 23, 31, 0.05)' : 'rgba(255, 255, 255, 0.06)';
  const dotColor = isLight ? 'rgba(15, 23, 31, 0.07)' : 'rgba(255, 255, 255, 0.08)';
  const textMuted = isLight ? 'text-onLight/60' : 'text-ink/50';

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="self-start font-body text-xs font-medium uppercase tracking-wider text-ink/60">
        Live preview
      </p>

      {/* phone chrome */}
      <div className="relative w-[300px] rounded-[2.5rem] border-[6px] border-ink bg-ink shadow-soft">
        <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-ink" />
        <div
          className="h-[580px] overflow-y-auto rounded-[2rem]"
          style={{
            backgroundColor: theme.bg,
            backgroundImage: [
              `radial-gradient(circle at 80% 0%, ${theme.glow} 0%, transparent 50%)`,
              `radial-gradient(circle at 10% 100%, ${counterGlow} 0%, transparent 60%)`,
            ].join(', '),
          }}
        >
          {!vendor.is_published && (
            <div className="border-b border-line bg-marigold px-3 py-1.5 text-center text-[11px] font-medium text-onMarigold">
              Preview mode — hidden until you publish
            </div>
          )}

          <div className="px-3 pb-8 pt-5">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className={clsx('font-display', isLight ? 'text-onLight' : 'text-ink')}>
                Shop<span className="text-marigold">Link</span>
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="relative overflow-hidden border-b border-line px-2">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
                    backgroundSize: '14px 14px',
                    maskImage: 'linear-gradient(to bottom, black, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
                  }}
                />
                <div className="relative">
                  <StorefrontHeader vendor={vendor} mode={theme.mode} />
                </div>
              </div>

              <div className="flex flex-col gap-3 p-3">
                <div className="flex items-center justify-between">
                  <h2 className={clsx('font-display text-sm', isLight ? 'text-onLight' : 'text-ink')}>
                    Catalog
                  </h2>
                  <p className={clsx('text-xs', textMuted)}>
                    {products === null ? '…' : `${products.length} item${products.length === 1 ? '' : 's'}`}
                  </p>
                </div>

                {products === null ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-line/40" />
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
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
                ) : (
                  <p className={clsx('text-xs', textMuted)}>
                    No products yet — add some from the Products tab and they'll show up here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-ink/50 underline underline-offset-2 hover:text-ink"
      >
        Open full preview ↗
      </a>
    </div>
  );
}