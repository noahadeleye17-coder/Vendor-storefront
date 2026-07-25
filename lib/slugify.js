// Slug generation for vendor storefront URLs: yoursite.ng/store/[slug]
// Matches the DB constraint in supabase/schema.sql: ^[a-z0-9-]{3,40}$

export function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // strip anything not alphanumeric/space/hyphen
    .replace(/\s+/g, '-')          // spaces -> hyphens
    .replace(/-+/g, '-')           // collapse repeated hyphens
    .replace(/^-|-$/g, '')         // trim leading/trailing hyphen
    .slice(0, 40);
}

// Appends a short random suffix when the base slug is already taken.
// Call this in a loop against a uniqueness check until it succeeds.
export function slugWithSuffix(base) {
  const suffix = Math.random().toString(36).slice(2, 6);
  const trimmedBase = base.slice(0, 40 - suffix.length - 1);
  return `${trimmedBase}-${suffix}`;
}

export function isValidSlug(slug) {
  return /^[a-z0-9-]{3,40}$/.test(slug);
}
