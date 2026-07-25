// add new product form
import { createClient } from '@/lib/supabaseServer';
import ProductForm from '@/components/ProductForm';

export default async function NewProductPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-ink">Add a product</h1>
      <p className="mt-1 text-ink/60">This shows up on your storefront as soon as you save it.</p>
      <div className="mt-6">
        <ProductForm mode="create" vendorId={user.id} />
      </div>
    </div>
  );
}