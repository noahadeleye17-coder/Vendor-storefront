import { createClient } from '@/lib/supabaseServer';
import AIAssistantToggle from '@/components/AIAssistantToggle';
import EmptyState from '@/components/ui/EmptyState';

// Groups the flat agent_conversations rows into per-session threads,
// newest session first, newest message last within each session.
function groupBySession(rows) {
  const sessions = new Map();
  for (const row of rows) {
    if (!sessions.has(row.session_id)) {
      sessions.set(row.session_id, { sessionId: row.session_id, messages: [], ledToWhatsapp: false, latest: row.created_at });
    }
    const session = sessions.get(row.session_id);
    session.messages.push(row);
    if (row.led_to_whatsapp) session.ledToWhatsapp = true;
    if (row.created_at > session.latest) session.latest = row.created_at;
  }
  return [...sessions.values()]
    .map((s) => ({ ...s, messages: s.messages.sort((a, b) => a.created_at.localeCompare(b.created_at)) }))
    .sort((a, b) => b.latest.localeCompare(a.latest));
}

export default async function AIAssistantPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, ai_chat_enabled')
    .eq('id', user.id)
    .single();

  // Last 100 messages is plenty for a recent-activity feed without an
  // unbounded query as conversation volume grows.
  const { data: rows } = await supabase
    .from('agent_conversations')
    .select('session_id, role, content, led_to_whatsapp, created_at')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const sessions = groupBySession(rows || []);
  const handoffCount = sessions.filter((s) => s.ledToWhatsapp).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-ink">AI Assistant</h1>
        <p className="mt-1 text-sm text-ink/60">
          A chat widget on your storefront that answers shopper questions from your product catalog.
        </p>
      </div>

      <div className="rounded-2xl border border-line p-5">
        <AIAssistantToggle vendorId={vendor.id} initialEnabled={vendor.ai_chat_enabled} />
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-line p-5">
            <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Conversations</p>
            <p className="mt-1 font-display text-2xl text-ink">{sessions.length}</p>
          </div>
          <div className="rounded-2xl border border-line p-5">
            <p className="font-mono text-xs uppercase tracking-wide text-ink/50">Led to WhatsApp</p>
            <p className="mt-1 font-display text-2xl text-jade">{handoffCount}</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg text-ink">Recent conversations</h2>
        {sessions.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No conversations yet"
              description={
                vendor.ai_chat_enabled
                  ? 'Once shoppers start chatting on your storefront, their questions and your assistant’s answers will show up here.'
                  : 'Turn the assistant on above, then shopper conversations will show up here.'
              }
              mode="dark"
            />
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {sessions.slice(0, 10).map((session) => (
              <div key={session.sessionId} className="rounded-2xl border border-line p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-ink/40">
                    {new Date(session.latest).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  {session.ledToWhatsapp && (
                    <span className="rounded-full bg-jade/10 px-2.5 py-1 text-xs font-medium text-jade">
                      Led to WhatsApp
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {session.messages.map((m, i) => (
                    <p key={i} className="text-sm">
                      <span className={m.role === 'user' ? 'text-ink/50' : 'text-ink'}>
                        {m.role === 'user' ? 'Shopper: ' : 'Assistant: '}
                      </span>
                      {m.content}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
