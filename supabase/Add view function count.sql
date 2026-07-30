-- ============================================================
-- Adds view count tracking for published storefronts.
--
-- Why a function instead of a plain `.update()` from the app:
-- the `vendors` table's only UPDATE policy is "vendor can update
-- own record" (auth.uid() = id) — anonymous customers browsing a
-- storefront have no session, so a direct update from the app
-- would be silently blocked by RLS (0 rows affected, no error).
--
-- SECURITY DEFINER lets this specific, narrow function bypass RLS
-- to do exactly one thing — atomically increment the counter for a
-- published vendor by slug — without opening up general write
-- access to the table.
--
-- Run this once in the Supabase SQL Editor.
-- ============================================================

create or replace function increment_view_count(vendor_slug text)
returns void as $$
begin
  update vendors
  set view_count = view_count + 1
  where slug = vendor_slug
    and is_published = true;
end;
$$ language plpgsql security definer;

-- Supabase grants execute on new public functions to anon/authenticated
-- by default, but this makes it explicit and safe to re-run.
grant execute on function increment_view_count(text) to anon, authenticated;