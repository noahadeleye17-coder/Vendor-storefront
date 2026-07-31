'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getFriendlyError } from '@/lib/friendlyError';
import { formatPrice } from '@/lib/whatsappLink';
import Button from './ui/Button';

export default function ProductRow({ product }) {
  const router = useRouter();
  const [inStock, setInStock] = useState(product.in_stock);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function toggleInStock() {
    const next = !inStock;
    setInStock(next); // optimistic — feels instant for a simple toggle
    const { error } = await supabase.from('products').update({ in_stock: next }).eq('id', product.id);
    if (error) setInStock(!next); // revert on failure
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError('');
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      setDeleteError(getFriendlyError(error));
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <>
      {/* flex-wrap + the actions block being `w-full` on mobile pushes the
          toggle/Edit/Delete onto their own line on narrow screens instead of
          cramming everything into one row. */}
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
          <p className="mt-0.5 text-xs text-ink/50">{inStock ? 'In stock' : 'Out of stock'}</p>
        </div>

        <div className="flex w-full flex-col gap-3 border-t border-line pt-3 sm:w-auto sm:flex-row sm:items-center sm:border-t-0 sm:pt-0">
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
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              {/* Ghost, not the solid `danger` variant — that stays reserved
                  for the actual confirm action below, so the list itself
                  doesn't read as alarming at rest. The red border/text is
                  enough to distinguish it from Edit at a glance. */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="border-red-400/40 text-red-400 hover:border-red-400/60"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-6 shadow-card">
            <h3 className="font-display text-lg text-ink">Delete this product?</h3>
            <p className="mt-2 text-sm text-ink/60">
              &quot;{product.name}&quot; will be removed from your storefront. This can&apos;t be
              undone.
            </p>

            {deleteError && <p className="mt-3 text-sm text-red-400">{deleteError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}