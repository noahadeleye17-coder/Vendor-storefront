// product list + delete/toggle in-stock
import Link from 'next/link';
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

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  const count = products?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink/60">
            {count} of {FREE_TIER_LIMIT} used on the free plan
          </p>
        </div>
        {count < FREE_TIER_LIMIT && (
          <Button as={Link} href="/dashboard/products/new" variant="marigold" size="md">
            Add product
          </Button>
        )}
      </div>

      {count === 0 ? (
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
        </div>
      )}
    </div>
  );
}