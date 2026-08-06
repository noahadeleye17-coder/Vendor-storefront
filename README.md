# ShopLink

A WhatsApp-native storefront platform for small vendors. A vendor signs up, adds their products, picks a theme, and gets a shareable storefront link — shoppers browse the catalog, chat with an AI concierge for help, and order straight over WhatsApp. No checkout, no payment processing, no inventory system to learn.

**Live:** https://vendor-storefront-roan.vercel.app
**Repo:** `noahadeleye17-coder/Vendor-storefront` (main branch)

---

## What it does

**For vendors**
- Sign up, set a business name/slug, WhatsApp number, and logo
- Add up to 20 products (name, price, photo, description, in-stock toggle) — enforced at the database level, not just the UI
- Pick a storefront theme (color + font presets, dark-mode only)
- See a live phone-mockup preview of the storefront while editing settings
- Publish/unpublish the storefront without deleting anything
- Turn on an AI chat assistant for shoppers, and watch its conversations in a dashboard feed
- Copy a shareable storefront link (with link-preview metadata for socials/DMs)

**For shoppers**
- Browse a vendor's published storefront — product grid, no login required
- Ask the AI concierge a question about the catalog; it answers from real product data and can recommend a specific item
- Tap "Order via WhatsApp" — either directly on a product, or from the concierge's recommendation — which opens a pre-filled WhatsApp chat with the vendor

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS, Framer Motion, lucide-react icons |
| Backend | Supabase (Postgres, Auth, Storage, Row Level Security) |
| AI | Groq (`llama-3.1-8b-instant`), OpenAI-compatible chat completions API — free tier |
| Hosting | Vercel |
| Image handling | `sharp` |

No custom backend server — Next.js API routes talk to Supabase directly, using RLS policies (not app-layer checks) as the actual access-control boundary.

---

## Project structure

```
app/
  (auth)/                 # sign up / log in
  dashboard/
    page.js               # dashboard home
    settings/              # business info, theme, logo — with live preview
    products/              # product list, new, edit
    ai-assistant/           # AI concierge toggle + conversation feed
  store/[slug]/            # public storefront (dynamic route per vendor)
  api/
    agent/route.js         # AI concierge chat endpoint
    agent/handoff/route.js # marks a chat session as "led to WhatsApp"
  contact/                 # contact page

components/                # StorefrontHeader, ProductCard, ThemePicker,
                            # StorefrontChat, StorefrontPreview, PhoneMockup, etc.

lib/
  agent/
    groqClient.js          # Groq API wrapper
    systemPrompt.js        # builds the concierge's system prompt from catalog data
  supabaseClient.js         # browser Supabase client
  supabaseServer.js         # server Supabase client
  slugify.js, whatsappLink.js, themePresets.js, friendlyError.js

supabase/
  schema.sql                       # Phase 1: vendors, products, RLS, storage bucket
  Add view function count.sql       # storefront view counter (SECURITY DEFINER RPC)
  Fix products select policy.sql    # lets vendors read their own unpublished products
  Add AI concierge agent.sql        # agent_conversations table + ai_chat_enabled flag
```

---

## Data model

**`vendors`** — one row per signed-up vendor (1:1 with `auth.users`). Business name, slug, WhatsApp number, logo URL, theme color/font, publish state, view count, `ai_chat_enabled`.

**`products`** — belongs to a vendor. Name, description, price, photo, in-stock flag, sort order. A trigger enforces a 20-product cap per vendor at the DB layer.

**`agent_conversations`** — one row per chat message (user or assistant), grouped by `session_id` so the dashboard can reconstruct threads. Tracks `recommended_product_id` and `led_to_whatsapp` for a simple conversion signal.

**Row Level Security** is the actual access boundary throughout:
- Public (anon key) can read published vendors/products, and insert/update `agent_conversations` (shoppers are anonymous, so chat logging has to stay open — nothing sensitive is stored there beyond what a shopper types).
- A vendor can only read/write their own `vendors` and `products` rows (`auth.uid() = id`), and only read their own `agent_conversations` (`auth.uid() = vendor_id`).
- View-count increments run through a `SECURITY DEFINER` RPC (`increment_view_count`) since anonymous visitors have no session to satisfy a normal RLS update policy.

---

## AI concierge — how it works

1. Shopper opens the chat widget on a published, AI-enabled storefront.
2. `POST /api/agent` looks up the vendor by slug, pulls up to 20 in-stock products, and builds a system prompt grounding the model in that vendor's actual catalog.
3. The last 6 turns of conversation history are sent along with the new message to Groq (`llama-3.1-8b-instant`, JSON-mode response, capped at 200 tokens) — kept short since this is a product-lookup chat, not open-ended conversation.
4. The model's reply is parsed for an optional recommended product; if present, the response includes that product and the vendor's WhatsApp number so the widget can render an order button.
5. Both turns are logged to `agent_conversations` (best-effort — a logging failure never blocks the shopper's reply).
6. If the shopper taps "Order via WhatsApp" from a recommendation, `POST /api/agent/handoff` marks that session as `led_to_whatsapp = true`.
7. The vendor's **AI Assistant** dashboard page shows: an on/off toggle, total conversation count, handoff count, and the 10 most recent conversations grouped into threads.

If Groq errors or times out, the route catches it and returns a graceful fallback reply instead of a 500 — the shopper is nudged to browse the catalog directly.

---

## Environment variables

| Variable | Used for | Where |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | client + server |
| `NEXT_PUBLIC_APP_URL` | Absolute URL used for storefront links/redirects — must be the deployed domain, not `localhost`, once deployed | client + server |
| `GROQ_API_KEY` | Groq chat completions auth | server only (`/api/agent`) |

Set these in `.env.local` for local dev and in the Vercel project settings for production.

⚠️ **Known gotcha:** `NEXT_PUBLIC_SUPABASE_URL` must be the bare project URL — do not append `/rest/v1/` or any path, or the build breaks.

---

## Setup

```bash
git clone https://github.com/noahadeleye17-coder/Vendor-storefront.git
cd Vendor-storefront
npm install
cp .env.example .env.local   # fill in the four vars above
```

Then, in the Supabase SQL Editor, run the migrations **in this order**:

1. `supabase/schema.sql`
2. `supabase/Add view function count.sql`
3. `supabase/Fix products select policy.sql`
4. `supabase/Add AI concierge agent.sql`

Get a free `GROQ_API_KEY` at [console.groq.com](https://console.groq.com).

```bash
npm run dev
```

---

## Deployment

Deployed on Vercel, connected to the `main` branch. Set all four env vars above in the Vercel project settings before the first deploy — a missing `NEXT_PUBLIC_APP_URL` will leave storefront links pointing at `localhost`.

---

## Current limitations / known constraints

- Hard cap of 20 products per vendor (by design, enforced at the DB level)
- No payments or checkout — WhatsApp is the only order path
- No custom domains per vendor yet
- `/api/agent` has no rate limiting — a burst of traffic could exhaust the Groq free-tier quota
- Theme picker is dark-mode presets only, no free-form color picker

---

## Roadmap ideas

- Rate limiting on the AI concierge endpoint
- Vendor-facing analytics (views, WhatsApp click-throughs, AI handoff rate) in one dashboard page
- Multi-image products
- Product search/filter for larger catalogs
- Custom domains