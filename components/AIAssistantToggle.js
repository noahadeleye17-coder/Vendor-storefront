'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { supabase } from '@/lib/supabaseClient';
import { getFriendlyError } from '@/lib/friendlyError';

export default function AIAssistantToggle({ vendorId, initialEnabled }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('vendors')
      .update({ ai_chat_enabled: next })
      .eq('id', vendorId);

    if (updateError) {
      setEnabled(!next);
      setError(getFriendlyError(updateError));
    } else {
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        disabled={saving}
        className={clsx(
          'relative inline-block h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50',
          enabled ? 'bg-jade' : 'bg-line'
        )}
      >
        <span
          className={clsx(
            'absolute left-1 top-1 h-5 w-5 rounded-full bg-paper transition-transform',
            enabled ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      <span className="whitespace-nowrap text-sm text-ink/70">
        {enabled ? 'Live on your storefront' : 'Off — not visible to shoppers'}
      </span>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
