-- ============================================================
-- Vendor Storefront — Phase 1 schema
-- Run this in Supabase SQL Editor (or via `supabase db push`)
-- ============================================================

-- ---------- vendors ----------
-- One row per signed-up vendor, 1:1 with auth.users
create table if not exists vendors (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  slug text not null unique,
  whatsapp_number text not null,           -- E.164 format, e.g. +2348012345678
  logo_url text,                           -- Supabase Storage public URL
  theme_color text default '#111827',      -- preset hex, not free-form picker in Phase 1
  theme_font text default 'inter',         -- key into a small preset list
  is_published boolean default true,       -- lets a vendor "unpublish" without deleting
  view_count integer default 0,            -- Phase 2 counter, included now to avoid a later migration
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_vendors_slug on vendors (slug);

-- slug format guard: lowercase letters, numbers, hyphens only, 3-40 chars
alter table vendors
  add constraint slug_format check (slug ~ '^[a-z0-9-]{3,40}$');

-- ---------- products ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  photo_url text,
  in_stock boolean default true,
  sort_order integer default 0,            -- lets vendors reorder without a rewrite later
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_vendor on products (vendor_id);

-- enforce the free-tier product cap (~15-20) at the database layer,
-- not just in the UI, so it can't be bypassed via direct API calls
create or replace function enforce_product_limit()
returns trigger as $$
begin
  if (select count(*) from products where vendor_id = new.vendor_id) >= 20 then
    raise exception 'Product limit reached for this plan (20 max)';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_product_limit on products;
create trigger trg_product_limit
  before insert on products
  for each row execute function enforce_product_limit();

-- ---------- updated_at auto-touch ----------
create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_vendors_touch on vendors;
create trigger trg_vendors_touch before update on vendors
  for each row execute function touch_updated_at();

drop trigger if exists trg_products_touch on products;
create trigger trg_products_touch before update on products
  for each row execute function touch_updated_at();

-- ============================================================
-- Row Level Security
-- Public storefront reads go through the anon key, so published
-- vendor/product data must be readable by anyone. Writes are
-- restricted to the owning vendor via auth.uid().
-- ============================================================

alter table vendors enable row level security;
alter table products enable row level security;

-- Anyone can read a published vendor's public profile (storefront page)
create policy "public can view published vendors"
  on vendors for select
  using (is_published = true);

-- A vendor can read/update only their own row (dashboard)
create policy "vendor can view own record"
  on vendors for select
  using (auth.uid() = id);

create policy "vendor can update own record"
  on vendors for update
  using (auth.uid() = id);

create policy "vendor can insert own record on signup"
  on vendors for insert
  with check (auth.uid() = id);

-- Anyone can read products belonging to a published vendor (storefront grid)
create policy "public can view products of published vendors"
  on products for select
  using (
    exists (
      select 1 from vendors
      where vendors.id = products.vendor_id
      and vendors.is_published = true
    )
  );

-- A vendor can manage only their own products (dashboard CRUD)
create policy "vendor can insert own products"
  on products for insert
  with check (auth.uid() = vendor_id);

create policy "vendor can update own products"
  on products for update
  using (auth.uid() = vendor_id);

create policy "vendor can delete own products"
  on products for delete
  using (auth.uid() = vendor_id);

-- ============================================================
-- Storage: product photos + logos
-- Run once — creates a public bucket. Adjust name if you'd
-- rather split logos and product photos into two buckets.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('vendor-media', 'vendor-media', true)
on conflict (id) do nothing;

create policy "public can view vendor media"
  on storage.objects for select
  using (bucket_id = 'vendor-media');

create policy "authenticated vendors can upload media"
  on storage.objects for insert
  with check (bucket_id = 'vendor-media' and auth.role() = 'authenticated');

create policy "vendors can update their own media"
  on storage.objects for update
  using (bucket_id = 'vendor-media' and owner = auth.uid());

create policy "vendors can delete their own media"
  on storage.objects for delete
  using (bucket_id = 'vendor-media' and owner = auth.uid());
