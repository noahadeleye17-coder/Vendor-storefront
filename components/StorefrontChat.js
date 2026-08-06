'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { MessageCircle, X, Send } from 'lucide-react';
import { buildWhatsAppOrderLink, formatPrice } from '@/lib/whatsappLink';

export default function StorefrontChat({ slug, businessName, mode = 'dark', hasProducts = true }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(crypto.randomUUID());
  const scrollRef = useRef(null);
  const isLight = mode === 'light';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          sessionId: sessionId.current,
          message: text,
          // Only send the last few turns back — keeps each request small.
          history: nextMessages.slice(-6),
        }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.error }]);
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, product: data.product, whatsappNumber: data.whatsappNumber, storeName: data.storeName },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, something went wrong — please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleWhatsAppClick() {
    fetch('/api/agent/handoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId.current }),
    }).catch(() => {});
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div
          className={clsx(
            'mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-line shadow-soft backdrop-blur-sm',
            isLight ? 'bg-white/95' : 'bg-[#111827]/95'
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className={clsx('font-display text-sm', isLight ? 'text-onLight' : 'text-ink')}>Ask {businessName}</p>
              <p className={clsx('text-xs', isLight ? 'text-onLight/50' : 'text-ink/50')}>AI concierge</p>
            </div>
            <button onClick={() => setOpen(false)} className={clsx(isLight ? 'text-onLight/50' : 'text-ink/50', 'hover:opacity-100')}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className={clsx('text-sm', isLight ? 'text-onLight/50' : 'text-ink/50')}>
                {hasProducts
                  ? 'Ask about a product — price, stock, whatever you need to know.'
                  : `${businessName} hasn't added any products yet, but you can still ask a question.`}
              </p>
            )}

            {messages.map((m, i) => (
              <div key={i} className={clsx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={clsx(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-jade text-paper'
                      : isLight
                      ? 'bg-black/5 text-onLight'
                      : 'bg-white/10 text-ink'
                  )}
                >
                  <p>{m.content}</p>
                  {m.product && (
                    <a
                      href={buildWhatsAppOrderLink({
                        whatsappNumber: m.whatsappNumber,
                        productName: m.product.name,
                        price: m.product.price,
                        storeName: m.storeName,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleWhatsAppClick}
                      className="mt-2 flex items-center justify-between rounded-xl bg-marigold px-3 py-2 text-onMarigold hover:brightness-105"
                    >
                      <span className="text-xs font-medium">{m.product.name}</span>
                      <span className="font-mono text-xs">₦{formatPrice(m.product.price)}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className={clsx('flex items-center gap-1 rounded-2xl px-3 py-3', isLight ? 'bg-black/5' : 'bg-white/10')}
                  aria-label="Assistant is typing"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={clsx('h-1.5 w-1.5 animate-bounce rounded-full', isLight ? 'bg-onLight/40' : 'bg-ink/40')}
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hasProducts ? 'Do you have...' : 'Ask a question...'}
              maxLength={500}
              className={clsx(
                'flex-1 rounded-full border border-line bg-transparent px-3 py-2 text-sm outline-none',
                isLight ? 'text-onLight placeholder:text-onLight/40' : 'text-ink placeholder:text-ink/40'
              )}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jade text-paper disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-jade text-paper shadow-soft hover:bg-jade-light"
        aria-label="Chat with store assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
