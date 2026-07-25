// ad'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import Input from './ui/Input';
import Button from './ui/Button';

export default function ProductForm({ mode, vendorId, initialProduct }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initialProduct?.name || '',
    price: initialProduct?.price || '',
    description: initialProduct?.description || '',
    in_stock: initialProduct?.in_stock ?? true,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialProduct?.photo_url || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto() {
    const ext = photoFile.name.split('.').pop();
    const path = `${vendorId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('vendor-media')
      .upload(path, photoFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('vendor-media').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let photoUrl = initialProduct?.photo_url || null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      const payload = {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        in_stock: form.in_stock,
        photo_url: photoUrl,
      };

      if (mode === 'create') {
        const { error: insertError } = await supabase
          .from('products')
          .insert({ ...payload, vendor_id: vendorId });
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', initialProduct.id);
        if (updateError) throw updateError;
      }

      router.push('/dashboard/products');
      router.refresh();
    } catch (err) {
      // The Phase 1 free-tier product cap (20) is enforced by a database
      // trigger (see supabase/schema.sql) — this is the message that
      // surfaces if a vendor hits it.
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="mb-1.5 font-body text-sm font-medium text-ink">Product photo</p>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-white/5">
            {photoPreview ? (
              <Image src={photoPreview} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-ink/40">
                No photo
              </div>
            )}
          </div>
          <label className="cursor-pointer text-sm font-medium text-jade">
            {photoPreview ? 'Change photo' : 'Upload photo'}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>
      </div>

      <Input
        id="name"
        label="Product name"
        placeholder="Ankara Wrap Dress"
        required
        value={form.name}
        onChange={update('name')}
      />

      <Input
        id="price"
        label="Price (₦)"
        type="number"
        min="0"
        step="1"
        placeholder="18500"
        required
        value={form.price}
        onChange={update('price')}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="font-body text-sm font-medium text-ink">
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={3}
          value={form.description}
          onChange={update('description')}
          className="rounded-xl border border-line bg-white px-4 py-2.5 font-body text-onLight placeholder:text-onLight/40"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={form.in_stock}
          onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked }))}
          className="h-4 w-4 rounded border-line accent-jade"
        />
        In stock
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" variant="marigold" size="lg" disabled={loading} className="mt-2">
        {loading ? 'Saving…' : mode === 'create' ? 'Add product' : 'Save changes'}
      </Button>
    </form>
  );
}d/edit product form fields
