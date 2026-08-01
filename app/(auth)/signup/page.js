'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Store, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, Upload, X, Loader2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import { slugify, slugWithSuffix, isValidSlug } from '@/lib/slugify';
import { getFriendlyError } from '@/lib/friendlyError';

const MAX_SLUG_ATTEMPTS = 5;
const TRUST_FEATURES = ['Free plan available', 'No card required', 'WhatsApp checkout'];

// Finds a slug that isn't already taken, starting from the business name
// and falling back to random suffixes on collision. Also handles the
// case where the business name alone doesn't produce a valid slug (e.g.
// too short, or entirely non-alphanumeric, like "24/7" or "!!!").
async function findAvailableSlug(businessName) {
  let base = slugify(businessName);
  if (!isValidSlug(base)) {
    base = 'store';
  }

  let candidate = base;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const { data: existing } = await supabase
      .from('vendors')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }

    candidate = slugWithSuffix(base);
  }

  // Extremely unlikely with a random suffix, but don't loop forever.
  throw new Error('Could not generate a unique store link. Please try a different business name.');
}

// Optional — a vendor can skip this at signup and add a logo later from
// Settings. Reuses the same `vendor-media` bucket LogoUploader/ProductForm
// upload to, so whatever gets picked here shows up as the storefront logo
// immediately. Failing to upload the image shouldn't block account
// creation, so this is called after the vendor row already exists and
// swallows its own errors into a console warning rather than the form's
// error state.
async function uploadBrandImage(vendorId, file) {
  try {
    const ext = file.name.split('.').pop();
    const path = `${vendorId}/logo-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('vendor-media')
      .upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('vendor-media').getPublicUrl(path);
    await supabase.from('vendors').update({ logo_url: data.publicUrl }).eq('id', vendorId);
  } catch (err) {
    console.warn('Brand image upload failed, continuing without it:', err);
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ businessName: '', email: '', password: '', whatsappNumber: '' });
  const [brandImage, setBrandImage] = useState(null);
  const [brandImagePreview, setBrandImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleBrandImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBrandImage(file);
    setBrandImagePreview(URL.createObjectURL(file));
  }

  function clearBrandImage() {
    setBrandImage(null);
    setBrandImagePreview('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(getFriendlyError(signUpError));
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      // Email confirmation is on — vendor row gets created after they
      // confirm and log in for the first time (handled in login flow),
      // since we need auth.uid() to exist before the RLS insert policy passes.
      router.push('/login?confirm=1');
      return;
    }

    try {
      const slug = await findAvailableSlug(form.businessName);

      const { error: vendorError } = await supabase.from('vendors').insert({
        id: userId,
        business_name: form.businessName,
        slug,
        whatsapp_number: form.whatsappNumber,
      });

      if (vendorError) {
        // Safety net for the rare race condition where two people grab the
        // same slug between our uniqueness check and this insert — the DB's
        // unique constraint (schema.sql) is what actually prevents the
        // collision; this just gives a clean retry instead of a raw
        // Postgres error.
        if (vendorError.code === '23505') {
          const retrySlug = await findAvailableSlug(`${form.businessName}-${Date.now()}`);
          const { error: retryError } = await supabase.from('vendors').insert({
            id: userId,
            business_name: form.businessName,
            slug: retrySlug,
            whatsapp_number: form.whatsappNumber,
          });
          if (retryError) throw retryError;
        } else {
          throw vendorError;
        }
      }

      if (brandImage) {
        await uploadBrandImage(userId, brandImage);
      }

      router.push('/dashboard');
    } catch (err) {
      setError(getFriendlyError(err));
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-jade-light">
        <Sparkles className="h-3.5 w-3.5" />
        Free forever
      </p>
      <h1 className="text-center font-display text-4xl text-ink">Create your store</h1>
      <p className="mt-2 text-center text-ink/70">Takes under a minute. No verification, no waiting.</p>

      <div className="mt-8 rounded-3xl border border-line p-6 shadow-card sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="businessName"
            label="Business name"
            placeholder="Amaka's Closet"
            icon={Store}
            required
            value={form.businessName}
            onChange={update('businessName')}
          />
          <Input
            id="whatsappNumber"
            label="WhatsApp number"
            placeholder="+2348012345678"
            type="tel"
            icon={Phone}
            required
            value={form.whatsappNumber}
            onChange={update('whatsappNumber')}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            required
            value={form.email}
            onChange={update('email')}
          />
          <Input
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            icon={Lock}
            minLength={8}
            required
            value={form.password}
            onChange={update('password')}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-ink/40 transition-colors hover:text-ink/70"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex flex-col gap-1.5">
            <span className="font-body text-xs font-medium uppercase tracking-wider text-ink/60">
              Brand image <span className="normal-case text-ink/40">(optional)</span>
            </span>
            <p className="text-xs text-ink/50">Logo, flyer, or any image that represents your store.</p>

            {brandImagePreview ? (
              <div className="mt-1 flex items-center gap-3 rounded-2xl border border-line p-3">
                <img
                  src={brandImagePreview}
                  alt="Brand preview"
                  className="h-12 w-12 shrink-0 rounded-xl object-cover"
                />
                <span className="flex-1 truncate text-sm text-ink/70">{brandImage?.name}</span>
                <button
                  type="button"
                  onClick={clearBrandImage}
                  aria-label="Remove image"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink/50 hover:bg-white/5 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="brandImage"
                className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-line px-4 py-4 text-sm text-ink/50 transition-colors hover:border-jade/40 hover:text-ink/70"
              >
                <Upload className="h-4 w-4" />
                Upload an image
                <input
                  id="brandImage"
                  type="file"
                  accept="image/*"
                  onChange={handleBrandImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" variant="marigold" size="lg" className="mt-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating your store…
              </>
            ) : (
              <>
                Get started
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already have a store?{' '}
          <Link href="/login" className="font-medium text-jade">
            Log in
          </Link>
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink/50">
        {TRUST_FEATURES.map((feature) => (
          <span key={feature} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-jade-light" />
            {feature}
          </span>
        ))}
      </div>
    </main>
  );
}