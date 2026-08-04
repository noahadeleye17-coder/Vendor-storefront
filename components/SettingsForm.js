'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { slugify, isValidSlug } from '@/lib/slugify';
import { getFriendlyError } from '@/lib/friendlyError';
import Input from './ui/Input';
import Button from './ui/Button';
import ThemePicker from './ThemePicker';
import LogoSettings from './LogoSettings';
import StorefrontPreview from './StorefrontPreview';

export default function SettingsForm({ vendor, appUrl }) {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: vendor.business_name || '',
    slug: vendor.slug || '',
    whatsappNumber: vendor.whatsapp_number || '',
    logoUrl: vendor.logo_url || null,
    themeColor: vendor.theme_color || '#1e8a73',
    themeFont: vendor.theme_font || 'inter',
    isPublished: vendor.is_published ?? true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const cleanSlug = slugify(form.slug);

      if (!isValidSlug(cleanSlug)) {
        throw new Error(
          'Store link must be 3-40 characters — lowercase letters, numbers, and hyphens only.'
        );
      }

      // Only hit the DB for a uniqueness check if the slug actually changed.
      if (cleanSlug !== vendor.slug) {
        const { data: existing } = await supabase
          .from('vendors')
          .select('id')
          .eq('slug', cleanSlug)
          .neq('id', vendor.id)
          .maybeSingle();

        if (existing) {
          throw new Error('That store link is already taken — try another.');
        }
      }

      const { error: updateError } = await supabase
        .from('vendors')
        .update({
          business_name: form.businessName,
          slug: cleanSlug,
          whatsapp_number: form.whatsappNumber,
          theme_color: form.themeColor,
          theme_font: form.themeFont,
          is_published: form.isPublished,
        })
        .eq('id', vendor.id);

      if (updateError) throw updateError;

      setForm((f) => ({ ...f, slug: cleanSlug }));
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  const storeUrl = `${appUrl}/store/${form.slug}`;

  // Shape the in-progress form state the way StorefrontHeader/ProductCard
  // (and therefore StorefrontPreview) expect a vendor row to look, so the
  // preview reflects unsaved edits instantly, before Save is pressed.
  const previewVendor = {
    business_name: form.businessName,
    logo_url: form.logoUrl,
    whatsapp_number: form.whatsappNumber,
    theme_color: form.themeColor,
    theme_font: form.themeFont,
    is_published: form.isPublished,
  };

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,32rem)_300px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 rounded-2xl border border-line p-6">
          <div>
            <h2 className="font-display text-lg text-ink">Store details</h2>
            <p className="mt-0.5 text-sm text-ink/60">Update your storefront's details, look and visibility.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Store logo</label>
            <LogoSettings
              vendorId={vendor.id}
              businessName={form.businessName}
              initialLogoUrl={vendor.logo_url}
              onLogoChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))}
            />
          </div>

          <Input
            id="businessName"
            label="Business name"
            required
            value={form.businessName}
            onChange={update('businessName')}
          />

          <div>
            <Input id="slug" label="Store link" required value={form.slug} onChange={update('slug')} />
            <p className="mt-1.5 break-all font-mono text-xs text-ink/50">{storeUrl}</p>
          </div>

          <Input
            id="whatsappNumber"
            label="WhatsApp number"
            type="tel"
            required
            value={form.whatsappNumber}
            onChange={update('whatsappNumber')}
          />
        </div>

        <div className="flex flex-col gap-5 rounded-2xl border border-line p-6">
          <div>
            <h2 className="font-display text-lg text-ink">Appearance</h2>
            <p className="mt-0.5 text-sm text-ink/60">Pick the accent and typography customers see.</p>
          </div>
          <ThemePicker
            color={form.themeColor}
            font={form.themeFont}
            onColorChange={(value) => setForm((f) => ({ ...f, themeColor: value }))}
            onFontChange={(key) => setForm((f) => ({ ...f, themeFont: key }))}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-line p-4">
          <div>
            <p className="font-body text-sm font-medium text-ink">
              {form.isPublished ? 'Storefront is live' : 'Storefront is hidden'}
            </p>
            <p className="mt-0.5 text-xs text-ink/50">
              {form.isPublished
                ? 'Customers can view your store and order.'
                : 'Your store link will show as not found until you go live again.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isPublished}
            onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              form.isPublished ? 'bg-jade' : 'bg-line'
            }`}
          >
            <span
              className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-ink transition-transform ${
                form.isPublished ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-jade-light">Saved!</p>}

        <Button type="submit" variant="marigold" size="lg" disabled={loading} className="mt-2">
          {loading ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <aside className="lg:sticky lg:top-8">
        <StorefrontPreview vendorId={vendor.id} vendor={previewVendor} storeUrl={storeUrl} />
      </aside>
    </div>
  );
}
