'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AuthSidePanel from '@/components/AuthSidePanel';
import { supabase } from '@/lib/supabaseClient';
import { getFriendlyError } from '@/lib/friendlyError';

const TRUST_FEATURES = ['Free plan available', 'No card required', 'WhatsApp checkout'];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

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
      setError(getFriendlyError(signInError));
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen">
      <AuthSidePanel />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16 lg:mx-0 lg:max-w-none lg:flex-1 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <p className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-jade-light">
            <Sparkles className="h-3.5 w-3.5" />
            Vendor dashboard
          </p>
          <h1 className="text-center font-display text-4xl text-ink">Welcome back</h1>
          <p className="mt-2 text-center text-ink/70">Log in to manage your store, products, and orders.</p>

          <div className="mt-8 rounded-3xl border border-line p-6 shadow-card sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-ink/70">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-line bg-transparent accent-jade"
                  />
                  Remember me
                </label>
                <span className="cursor-not-allowed font-medium text-jade-light" title="Coming soon">
                  Forgot password?
                </span>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" variant="marigold" size="lg" className="mt-2" disabled={loading}>
                {loading ? 'Logging in…' : (
                  <>
                    Log in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink/60">
              Don&apos;t have a store yet?{' '}
              <Link href="/signup" className="font-medium text-jade">
                Sign up
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
        </div>
      </div>
    </main>
  );
}