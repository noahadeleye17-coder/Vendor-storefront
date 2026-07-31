'use client';

import clsx from 'clsx';
import { COLOR_PRESETS, FONT_PRESETS } from '@/lib/themePresets';

// Preset color/font picker for storefront branding. Fully controlled —
// parent (SettingsForm) owns the state and passes the current values in.
export default function ThemePicker({ color, font, onColorChange, onFontChange }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-ink/60">Accent color</p>
        <div className="flex flex-wrap gap-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => onColorChange(preset.value)}
              aria-label={preset.label}
              aria-pressed={color === preset.value}
              className={clsx(
                'h-9 w-9 rounded-full border-2 transition-transform',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade',
                color === preset.value
                  ? 'border-ink scale-110'
                  : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: preset.value }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-ink/60">Storefront font</p>
        <div className="flex flex-wrap gap-2">
          {FONT_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => onFontChange(preset.key)}
              aria-pressed={font === preset.key}
              style={{ fontFamily: preset.family }}
              className={clsx(
                'rounded-xl border px-4 py-2 text-sm transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade',
                font === preset.key
                  ? 'border-jade bg-jade/10 text-ink'
                  : 'border-line text-ink/70 hover:border-ink/40'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}