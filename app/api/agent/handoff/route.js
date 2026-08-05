import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

// Called when a shopper taps "Order via WhatsApp" on an agent-recommended
// product, so the dashboard can show how many chats actually converted.
export async function POST(req) {
  const supabase = createClient();
  const { sessionId } = await req.json().catch(() => ({}));

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  await supabase
    .from('agent_conversations')
    .update({ led_to_whatsapp: true })
    .eq('session_id', sessionId)
    .eq('role', 'assistant');

  return NextResponse.json({ ok: true });
}
