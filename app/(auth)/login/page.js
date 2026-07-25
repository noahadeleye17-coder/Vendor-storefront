'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl text-ink">Welcome back</h1>
      <p className="mt-2 text-ink/70">Log in to manage your store.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
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
          required
          value={form.password}
          onChange={update('password')}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" variant="primary" size="lg" className="mt-2" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Don&apos;t have a store yet?{' '}
        <Link href="/signup" className="font-medium text-jade">
          Sign up
        </Link>
      </p>
    </main>
  );
}
