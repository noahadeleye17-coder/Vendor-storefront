-- ============================================================
-- Fix: vendors couldn't read their own products once unpublished
-- (surfaced by the new publish/unpublish toggle + storefront preview).
--
-- The only existing SELECT policy on `products` was
-- "public can view products of published vendors" — which also gated
-- the VENDOR's own dashboard/preview reads, since it only checked
-- whether the linked vendor row was published, not who was asking.
--
-- This adds a second, independent SELECT policy: a vendor can always
-- read their own products regardless of publish state. Postgres
-- combines multiple permissive policies with OR, so this only adds
-- access — it doesn't change what the public can already see.
--
-- Run this once in the Supabase SQL Editor.
-- ============================================================

drop policy if exists "vendor can view own products" on products;

create policy "vendor can view own products"
  on products for select
  using (auth.uid() = vendor_id);