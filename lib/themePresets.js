// Shared preset values for storefront branding. Presets only (per the
// Phase 1 schema comment) — no free-form color/font pickers yet.
// Colors reuse the same palette already used in ROADMAP.md's diagram
// styling (jade, coral, indigo) so the brand stays consistent.
//
// Each preset carries:
// - value: the accent hex (used for the logo ring, buttons, etc.)
// - bg: a deep near-black tint of that hue, replacing the app's default
//   --color-paper on storefront pages so the WHOLE page reads as that
//   vendor's color, not just a corner glow
// - glow: a lighter, translucent version of the accent for the radial
//   highlight layered on top of bg

export const COLOR_PRESETS = [
  {
    key: 'jade',
    label: 'Jade',
    value: '#1e8a73',
    bg: '#0c211c', // same dark jade-black the app already uses by default
    glow: 'rgba(30, 138, 115, 0.32)',
  },
  {
    key: 'marigold',
    label: 'Marigold',
    value: '#f2a93b',
    bg: '#211a0d', // deep amber-black
    glow: 'rgba(242, 169, 59, 0.32)',
  },
  {
    key: 'coral',
    label: 'Coral',
    value: '#d85a30',
    bg: '#21120a', // deep coral-black
    glow: 'rgba(216, 90, 48, 0.32)',
  },
  {
    key: 'indigo',
    label: 'Indigo',
    value: '#534ab7',
    bg: '#150f28', // deep violet-black
    glow: 'rgba(83, 74, 183, 0.32)',
  },
  {
    key: 'slate',
    label: 'Slate',
    value: '#64748b',
    bg: '#11161c', // deep slate-black
    glow: 'rgba(100, 116, 139, 0.32)',
  },
];

// Font presets are restricted to fonts already loaded in app/layout.js
// (Bricolage Grotesque, Inter, IBM Plex Mono) plus one system serif —
// so picking a preset never triggers an extra font download.
export const FONT_PRESETS = [
  { key: 'inter', label: 'Modern', family: 'var(--font-body)' },
  { key: 'display', label: 'Bold', family: 'var(--font-display)' },
  { key: 'mono', label: 'Technical', family: 'var(--font-mono)' },
  { key: 'serif', label: 'Editorial', family: 'Georgia, "Times New Roman", serif' },
];

export function getFontFamily(key) {
  return FONT_PRESETS.find((f) => f.key === key)?.family || FONT_PRESETS[0].family;
}

// Falls back to the jade preset for any stored value that isn't a known
// preset (e.g. old rows saved before this list existed).
export function getThemePreset(hex) {
  return (
    COLOR_PRESETS.find((p) => p.value.toLowerCase() === (hex || '').toLowerCase()) ||
    COLOR_PRESETS[0]
  );
}