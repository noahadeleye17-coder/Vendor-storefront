'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// Owner-only overlay button on the storefront logo — lets a vendor swap
// their logo right from the live/preview page instead of hunting for it
// in Settings. Reuses the same `vendor-media` bucket ProductForm uploads to.
export default function LogoUploader({ vendorId }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `${vendorId}/logo-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('vendor-media')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('vendor-media').getPublicUrl(path);
      await supabase.from('vendors').update({ logo_url: data.publicUrl }).eq('id', vendorId);
      router.refresh();
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Change logo"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-paper bg-ink text-paper shadow-card"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </>
  );
}