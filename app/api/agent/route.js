import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { buildSystemPrompt } from '@/lib/agent/systemPrompt';
import { askAgent } from '@/lib/agent/groqClient';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Only the last few turns are sent — full history isn't needed for a
// product-lookup chat and every extra turn costs tokens on each request.
const MAX_HISTORY_MESSAGES = 6;

// Caps worst-case Groq spend from any single visitor. Wide enough for a
// real back-and-forth conversation, tight enough to stop a retry loop or
// a script from burning the free-tier quota in one sitting.
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req) {
  const supabase = createClient();

  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = rateLimit(`agent:${ip}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);

  if (!allowed) {
    return NextResponse.json(
      { error: "You're sending messages a bit fast — try again in a minute." },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { slug, sessionId, message, history } = body;

  if (!slug || !sessionId || !message?.trim()) {
    return NextResponse.json({ error: 'Missing slug, sessionId, or message' }, { status: 400 });
  }
  if (message.length > 500) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 });
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, business_name, whatsapp_number, ai_chat_enabled')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!vendor || !vendor.ai_chat_enabled) {
    return NextResponse.json({ error: 'Chat is not available for this store' }, { status: 404 });
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, in_stock')
    .eq('vendor_id', vendor.id)
    .eq('in_stock', true)
    .order('sort_order', { ascending: true })
    .limit(20);

  // Nothing in stock — every possible reply is "we have nothing", so skip
  // the Groq call entirely (saves quota and latency) and answer directly.
  // Still logged below so the vendor's dashboard feed shows the shopper
  // was interested, even with an empty catalog.
  if (!products || products.length === 0) {
    const emptyCatalogReply = `We don't have any items in stock right now — check back soon, or message ${vendor.business_name} directly on WhatsApp to ask.`;

    try {
      await supabase.from('agent_conversations').insert([
        { vendor_id: vendor.id, session_id: sessionId, role: 'user', content: message.trim() },
        { vendor_id: vendor.id, session_id: sessionId, role: 'assistant', content: emptyCatalogReply },
      ]);
    } catch (err) {
      console.error('Failed to log agent conversation:', err.message);
    }

    return NextResponse.json({
      reply: emptyCatalogReply,
      product: null,
      whatsappNumber: null,
      storeName: vendor.business_name,
    });
  }

  const systemPrompt = buildSystemPrompt({ businessName: vendor.business_name, products });

  const trimmedHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_MESSAGES) : [];

  let agentResult;
  try {
    agentResult = await askAgent([
      { role: 'system', content: systemPrompt },
      ...trimmedHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message.trim() },
    ]);
  } catch (err) {
    console.error('Agent request failed:', err.message);
    return NextResponse.json(
      { reply: "Sorry, I'm having trouble right now — feel free to browse the catalog below.", product: null },
      { status: 200 }
    );
  }

  const recommendedProduct = agentResult.product_id
    ? products?.find((p) => p.id === agentResult.product_id) || null
    : null;

  // Log both turns for the vendor dashboard feed. Best-effort — a logging
  // failure shouldn't block the shopper from getting their answer.
  try {
    await supabase.from('agent_conversations').insert([
      { vendor_id: vendor.id, session_id: sessionId, role: 'user', content: message.trim() },
      {
        vendor_id: vendor.id,
        session_id: sessionId,
        role: 'assistant',
        content: agentResult.reply,
        recommended_product_id: recommendedProduct?.id || null,
      },
    ]);
  } catch (err) {
    console.error('Failed to log agent conversation:', err.message);
  }

  return NextResponse.json({
    reply: agentResult.reply,
    product: recommendedProduct,
    whatsappNumber: recommendedProduct ? vendor.whatsapp_number : null,
    storeName: vendor.business_name,
  });
}
