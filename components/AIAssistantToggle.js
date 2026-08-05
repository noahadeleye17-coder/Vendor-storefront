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
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        disabled={saving}
        className={clsx(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50',
          enabled ? 'bg-jade' : 'bg-line'
        )}
      >
        <span
          className={clsx(
            'absolute top-1 h-5 w-5 rounded-full bg-paper transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      <span className="text-sm text-ink/70">
        {enabled ? 'Live on your storefront' : 'Off — not visible to shoppers'}
      </span>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
