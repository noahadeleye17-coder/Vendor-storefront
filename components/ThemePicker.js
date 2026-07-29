// theme color/font picker used in dashboard settings
'use client';

const COLOR_PRESETS = [
  { value: '#111827', label: 'Charcoal' },
  { value: '#0F766E', label: 'Jade' },
  { value: '#B45309', label: 'Marigold' },
  { value: '#9D174D', label: 'Rose' },
  { value: '#1E3A8A', label: 'Indigo' },
  { value: '#78350F', label: 'Terracotta' },
];

const FONT_PRESETS = [
  { value: 'inter', label: 'Inter — clean, modern' },
  { value: 'playfair', label: 'Playfair — elegant, editorial' },
  { value: 'space-grotesk', label: 'Space Grotesk — bold, tech' },
  { value: 'work-sans', label: 'Work Sans — friendly, neutral' },
];

export default function ThemePicker({ color, font, onColorChange, onFontChange }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 font-body text-sm font-medium text-ink">Accent color</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              aria-pressed={color === preset.value}
              onClick={() => onColorChange(preset.value)}
              title={preset.label}
              className={`h-9 w-9 rounded-full border-2 transition-transform ${
                color === preset.value
                  ? 'scale-110 border-ink'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: preset.value }}
            />
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="themeFont" className="mb-1.5 block font-body text-sm font-medium text-ink">
          Font style
        </label>
        <select
          id="themeFont"
          value={font}
          onChange={(e) => onFontChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 font-body text-onLight"
        >
          {FONT_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}