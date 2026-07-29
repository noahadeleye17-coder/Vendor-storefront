// Shared preset values for storefront branding. Presets only (per the
// Phase 1 schema comment) — no free-form color/font pickers yet.
// Colors reuse the same palette already used in ROADMAP.md's diagram
// styling (jade, coral, indigo) so the brand stays consistent.

export const COLOR_PRESETS = [
  { key: 'jade', label: 'Jade', value: '#1e8a73' },
  { key: 'marigold', label: 'Marigold', value: '#f2a93b' },
  { key: 'coral', label: 'Coral', value: '#d85a30' },
  { key: 'indigo', label: 'Indigo', value: '#534ab7' },
  { key: 'slate', label: 'Slate', value: '#64748b' },
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