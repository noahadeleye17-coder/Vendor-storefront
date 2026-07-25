'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';
import { slugify } from '@/lib/slugify';

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
      setError(signUpError.message);
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

    const baseSlug = slugify(form.businessName);
    const { error: vendorError } = await supabase.from('vendors').insert({
      id: userId,
      business_name: form.businessName,
      slug: baseSlug,
      whatsapp_number: form.whatsappNumber,
    });

    if (vendorError) {
      setError(vendorError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
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
