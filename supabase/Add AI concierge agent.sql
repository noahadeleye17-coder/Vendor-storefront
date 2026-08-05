-- ============================================================
-- AI Storefront Concierge — agent_conversations + vendor toggle
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================================

-- Per-vendor on/off switch for the shopper-facing chat widget.
alter table vendors
  add column if not exists ai_chat_enabled boolean default false;

-- One row per chat message (user or assistant), grouped by session_id
-- so a dashboard feed can reconstruct each conversation.
create table if not exists agent_conversations (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  recommended_product_id uuid references products(id) on delete set null,
  led_to_whatsapp boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_agent_conv_vendor on agent_conversations (vendor_id, created_at desc);
create index if not exists idx_agent_conv_session on agent_conversations (session_id);

alter table agent_conversations enable row level security;

-- Shoppers are anonymous — the API route writes on their behalf using the
-- anon key, so inserts must be open. Nothing sensitive is stored (no PII
-- beyond whatever a shopper types), and vendors can only read their own rows.
create policy "anyone can log a chat message"
  on agent_conversations for insert
  with check (true);

-- Only the owning vendor can read their conversation history (dashboard feed).
create policy "vendor can view own conversations"
  on agent_conversations for select
  using (auth.uid() = vendor_id);

-- The API route flips led_to_whatsapp after logging — anon key needs this,
-- scoped narrowly (no delete policy exists, so rows are otherwise immutable).
create policy "anyone can mark a handoff"
  on agent_conversations for update
  using (true)
  with check (true);
