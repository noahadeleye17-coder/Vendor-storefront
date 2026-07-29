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
    // flex-wrap + the actions block below being `w-full` on mobile is what
    // pushes the toggle/Edit/Delete onto their own line on narrow screens
    // instead of cramming everything into one row (previously the in-stock
    // toggle was just hidden below the sm breakpoint — invisible on phone).
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line p-4">
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

      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <button
          type="button"
          role="switch"
          aria-checked={inStock}
          aria-label="In stock"
          onClick={toggleInStock}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            inStock ? 'bg-jade' : 'bg-line'
          }`}
        >
          <span
            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-ink transition-transform ${
              inStock ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>

        <div className="flex items-center gap-2">
          <Button as={Link} href={`/dashboard/products/${product.id}`} variant="ghost" size="sm">
            Edit
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? '…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}