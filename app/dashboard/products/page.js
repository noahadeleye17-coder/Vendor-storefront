// product list + delete/toggle in-stock
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { createClient } from '@/lib/supabaseServer';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ProductRow from '@/components/ProductRow';

const FREE_TIER_LIMIT = 20;

export default async function ProductsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const count = products?.length ?? 0;
  const remaining = FREE_TIER_LIMIT - count;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-line p-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink/60">
            {productsError ? "Couldn't load your product count" : `${count} of ${FREE_TIER_LIMIT} used on the free plan`}
          </p>
        </div>
        {count < FREE_TIER_LIMIT && (
          <Button as={Link} href="/dashboard/products/new" variant="marigold" size="lg" className="w-full">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        )}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-jade"
            style={{ width: `${Math.min(100, (count / FREE_TIER_LIMIT) * 100)}%` }}
          />
        </div>
      </div>

      {productsError ? (
        <EmptyState
          title="Couldn't load your products"
          description="Something went wrong fetching your catalog. Refresh the page to try again."
        />
      ) : count === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to start sharing your storefront link."
          actionLabel="Add your first product"
          actionHref="/dashboard/products/new"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}

          {remaining > 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-line px-6 py-10 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-jade/10 text-jade">
                <Package className="h-5 w-5" />
              </span>
              <p className="font-display text-lg text-ink">Room for {remaining} more</p>
              <p className="max-w-xs text-sm text-ink/60">
                Add more products to keep customers browsing your storefront.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}