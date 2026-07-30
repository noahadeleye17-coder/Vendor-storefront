'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import { slugify, slugWithSuffix, isValidSlug } from '@/lib/slugify';
import { getFriendlyError } from '@/lib/friendlyError';

const MAX_SLUG_ATTEMPTS = 5;

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

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ businessName: '', email: '', password: '', whatsappNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
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

      router.push('/dashboard');
    } catch (err) {
      setError(getFriendlyError(err));
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Create your store</h1>
      <p className="mt-2 text-ink/70">Takes under a minute. No verification, no waiting.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          id="businessName"
          label="Business name"
          placeholder="Amaka's Closet"
          required
          value={form.businessName}
          onChange={update('businessName')}
        />
        <Input
          id="whatsappNumber"
          label="WhatsApp number"
          placeholder="+2348012345678"
          type="tel"
          required
          value={form.whatsappNumber}
          onChange={update('whatsappNumber')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={update('email')}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          minLength={8}
          required
          value={form.password}
          onChange={update('password')}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" variant="primary" size="lg" className="mt-2" disabled={loading}>
          {loading ? 'Creating your store…' : 'Get started'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have a store?{' '}
        <Link href="/login" className="font-medium text-jade">
          Log in
        </Link>
      </p>
    </main>
  );
}