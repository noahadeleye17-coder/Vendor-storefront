'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { formatPrice } from '@/lib/whatsappLink';
import Button from './ui/Button';

export default function ProductRow({ product }) {
  const router = useRouter();
  const [inStock, setInStock] = useState(product.in_stock);
  const [deleting, setDeleting] = useState(false);

  async function toggleInStock() {
    const next = !inStock;
    setInStock(next); // optimistic — feels instant for a simple toggle
    const { error } = await supabase.from('products').update({ in_stock: next }).eq('id', product.id);
    if (error) setInStock(!next); // revert on failure
  }

  async function handleDelete() {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeleting(true);
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      alert(error.message);
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line p-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
        {product.photo_url ? (
          <Image src={product.photo_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-ink/40">
            No photo
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base text-ink">{product.name}</p>
        <p className="font-mono text-sm text-jade">₦{formatPrice(product.price)}</p>
      </div>

      <label className="hidden items-center gap-2 text-sm text-ink/70 sm:flex">
        <input
          type="checkbox"
          checked={inStock}
          onChange={toggleInStock}
          className="h-4 w-4 rounded border-line accent-jade"
        />
        In stock
      </label>

      <Button as={Link} href={`/dashboard/products/${product.id}`} variant="ghost" size="sm">
        Edit
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
        {deleting ? '…' : 'Delete'}
      </Button>
    </div>
  );
}