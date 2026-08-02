'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getFriendlyError } from '@/lib/friendlyError';
import Button from './ui/Button';

// Lets a vendor set, replace, or remove their storefront logo from
// Settings. Reuses the same `vendor-media` bucket ProductForm uploads to.
export default function LogoSettings({ vendorId, businessName, initialLogoUrl }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `${vendorId}/logo-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('vendor-media')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('vendor-media').getPublicUrl(path);
      const { error: updateError } = await supabase
        .from('vendors')
        .update({ logo_url: data.publicUrl })
        .eq('id', vendorId);
      if (updateError) throw updateError;

      setLogoUrl(data.publicUrl);
      router.refresh();
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleRemove() {
    setError('');
    setRemoving(true);

    try {
      const { error: updateError } = await supabase
        .from('vendors')
        .update({ logo_url: null })
        .eq('id', vendorId);
      if (updateError) throw updateError;

      setLogoUrl(null);
      router.refresh();
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-line/20">
        {logoUrl ? (
          <Image src={logoUrl} alt={businessName} width={64} height={64} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-xl text-ink/40">{businessName?.charAt(0)?.toUpperCase()}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || removing}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {logoUrl ? 'Change logo' : 'Upload logo'}
          </Button>
          {logoUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={uploading || removing}>
              {removing ? 'Removing…' : 'Remove'}
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </div>
  );
}