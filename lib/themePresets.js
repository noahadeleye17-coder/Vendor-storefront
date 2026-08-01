// Shared preset values for storefront branding. Presets only (per the
// Phase 1 schema comment) — no free-form color/font pickers yet.
//
// Each preset carries a `mode`: 'dark' storefronts keep the app's usual
// light-text-on-deep-background look; 'light' storefronts flip to a
// pale background with dark text instead — needed for anything in the
// white/cream/sky-blue/ash family, since those only make sense as an
// actual light page, not a dark page with a pale corner glow.
//
// - value: the accent hex (logo ring, "live" indicators, etc.) — chosen
//   to contrast against that preset's own `bg`, not just look nice in
//   isolation
// - bg: the page's base background color
// - glow: a translucent version of the accent, layered as a radial
//   highlight on top of bg for depth. Tuned strong enough to actually
//   read as a deliberate gradient, not just a faint smudge.

export const COLOR_PRESETS = [
  // ---------- dark ----------
  {
    key: 'jade',
    label: 'Jade',
    value: '#1e8a73',
    bg: '#0c211c',
    glow: 'rgba(30, 138, 115, 0.4)',
    mode: 'dark',
  },
  {
    key: 'marigold',
    label: 'Marigold',
    value: '#f2a93b',
    bg: '#211a0d',
    glow: 'rgba(242, 169, 59, 0.4)',
    mode: 'dark',
  },
  {
    key: 'coral',
    label: 'Coral',
    value: '#d85a30',
    bg: '#21120a',
    glow: 'rgba(216, 90, 48, 0.4)',
    mode: 'dark',
  },
  {
    key: 'indigo',
    label: 'Indigo',
    value: '#534ab7',
    bg: '#150f28',
    glow: 'rgba(83, 74, 183, 0.4)',
    mode: 'dark',
  },
  {
    key: 'black',
    label: 'Black',
    value: '#e5e5e5',
    bg: '#0a0a0a',
    glow: 'rgba(255, 255, 255, 0.2)',
    mode: 'dark',
  },
  {
    key: 'yellow',
    label: 'Yellow',
    value: '#e8c547',
    bg: '#211d0a',
    glow: 'rgba(232, 197, 71, 0.4)',
    mode: 'dark',
  },
  {
    key: 'blue',
    label: 'Blue',
    value: '#3b82c4',
    bg: '#0a1a24',
    glow: 'rgba(59, 130, 196, 0.4)',
    mode: 'dark',
  },
  {
    key: 'rose',
    label: 'Rose',
    value: '#d1547d',
    bg: '#210c15',
    glow: 'rgba(209, 84, 125, 0.4)',
    mode: 'dark',
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