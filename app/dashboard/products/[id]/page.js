// edit existing product form
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import ProductForm from '@/components/ProductForm';

export default async function EditProductPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .eq('vendor_id', user.id) // belt-and-suspenders on top of RLS
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-ink">Edit product</h1>
      <div className="mt-6">
        <ProductForm mode="edit" vendorId={user.id} initialProduct={product} />
      </div>
    </div>
  );
}