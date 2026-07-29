'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { slugify, isValidSlug } from '@/lib/slugify';
import Input from './ui/Input';
import Button from './ui/Button';
import ThemePicker from './ThemePicker';

export default function SettingsForm({ vendor }) {
  const router = useRouter();

  const [form, setForm] = useState({
    businessName: vendor.business_name || '',
    slug: vendor.slug || '',
    whatsappNumber: vendor.whatsapp_number || '',
    isPublished: vendor.is_published ?? true,
    themeColor: vendor.theme_color || '#111827',
    themeFont: vendor.theme_font || 'inter',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(vendor.logo_url || null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function uploadLogo() {
    const ext = logoFile.name.split('.').pop();
    const path = `${vendor.id}/logo-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('vendor-media')
      .upload(path, logoFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('vendor-media').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const cleanSlug = slugify(form.slug);
    if (!isValidSlug(cleanSlug)) {
      setError('Store link must be 3-40 characters: lowercase letters, numbers, and hyphens only.');
      return;
    }

    setLoading(true);

    try {
      // Only hit the DB for a uniqueness check if the slug actually changed —
      // no need to bother Supabase on every save.
      if (cleanSlug !== vendor.slug) {
        const { data: existing } = await supabase
          .from('vendors')
          .select('id')
          .eq('slug', cleanSlug)
          .neq('id', vendor.id)
          .maybeSingle();

        if (existing) {
          setError('That store link is already taken. Try a different one.');
          setLoading(false);
          return;
        }
      }

      let logoUrl = vendor.logo_url || null;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const payload = {
        business_name: form.businessName,
        slug: cleanSlug,
        whatsapp_number: form.whatsappNumber,
        logo_url: logoUrl,
        theme_color: form.themeColor,
        theme_font: form.themeFont,
        is_published: form.isPublished,
      };

      const { error: updateError } = await supabase
        .from('vendors')
        .update(payload)
        .eq('id', vendor.id);

      if (updateError) throw updateError;

      setForm((f) => ({ ...f, slug: cleanSlug }));
      setSuccess(true);
      router.refresh();
    } catch (err) {
      // Covers the rare race where two people grab the same slug at once —
      // the DB's unique constraint catches what the pre-check above misses.
      if (err.code === '23505') {
        setError('That store link is already taken. Try a different one.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
      <div>
        <p className="mb-1.5 font-body text-sm font-medium text-ink">Store logo</p>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line bg-white/5">
            {logoPreview ? (
              <Image src={logoPreview} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-ink/40">
                No logo
              </div>
            )}
          </div>
          <label className="cursor-pointer text-sm font-medium text-jade">
            {logoPreview ? 'Change logo' : 'Upload logo'}
            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </label>
        </div>
      </div>

      <Input
        id="businessName"
        label="Business name"
        required
        value={form.businessName}
        onChange={update('businessName')}
      />

      <div>
        <Input
          id="slug"
          label="Store link"
          required
          value={form.slug}
          onChange={update('slug')}
        />
        <p className="mt-1.5 text-xs text-ink/50">
          Your storefront: {process.env.NEXT_PUBLIC_APP_URL || 'yoursite.ng'}/store/
          {slugify(form.slug) || 'your-store'}
        </p>
      </div>

      <Input
        id="whatsappNumber"
        label="WhatsApp number"
        type="tel"
        placeholder="+2348012345678"
        required
        value={form.whatsappNumber}
        onChange={update('whatsappNumber')}
      />

      <ThemePicker
        color={form.themeColor}
        font={form.themeFont}
        onColorChange={(value) => setForm((f) => ({ ...f, themeColor: value }))}
        onFontChange={(value) => setForm((f) => ({ ...f, themeFont: value }))}
      />

      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
          className="h-4 w-4 rounded border-line accent-jade"
        />
        Store is live
        <span className="font-normal text-ink/50">
          — uncheck to take your storefront offline temporarily
        </span>
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-jade">Saved.</p>}

      <Button type="submit" variant="marigold" size="lg" disabled={loading} className="mt-2">
        {loading ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}