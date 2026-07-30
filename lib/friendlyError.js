// Every form in the app was showing raw Supabase/Postgres error text
// straight to vendors ("new row violates row-level security policy",
// "duplicate key value violates unique constraint..."). This maps the
// common raw-error cases to plain language that matches the rest of the
// product's copy.
//
// Falls back to error.message (not a hardcoded generic string) when
// nothing matches — that's deliberate: a few flows (signup slug checks,
// settings slug checks) already throw their own hand-written, friendly
// messages like "That store link is already taken — try another.", and
// those should pass through unchanged rather than get overwritten by a
// generic fallback.
export function getFriendlyError(error) {
  const message = error?.message || '';

  if (/invalid login credentials/i.test(message)) {
    return "That email or password isn't right. Double-check and try again.";
  }
  if (/user already registered/i.test(message)) {
    return 'An account with that email already exists — try logging in instead.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Please confirm your email first — check your inbox for the link.';
  }
  if (/password should be at least/i.test(message)) {
    return 'Your password needs to be at least 8 characters.';
  }
  if (/product limit reached/i.test(message)) {
    return "You've hit the 20-product limit on the free plan.";
  }
  if (error?.code === '23505' || /duplicate key/i.test(message)) {
    return 'That store link is already taken — try another.';
  }
  if (/row-level security/i.test(message)) {
    return "We couldn't save that. Try logging out and back in, then give it another go.";
  }
  if (/failed to fetch|networkerror/i.test(message)) {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  return message || 'Something went wrong. Please try again.';
}