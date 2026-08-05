// Minimal wrapper around Groq's OpenAI-compatible chat completions endpoint.
// Groq's free tier is generous and fast — good fit for a $0 side project.
// Get a key at https://console.groq.com and set GROQ_API_KEY in .env.local
// (and in Vercel's project env vars for production).

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// A small, fast model — cheaper on tokens/rate limits than the larger
// Groq models, and plenty capable for short catalog-grounded replies.
const MODEL = 'llama-3.1-8b-instant';

export async function askAgent(messages) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      // Caps runaway output — this app only ever needs a couple sentences.
      max_tokens: 200,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Groq request failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error('Groq returned no content');
  }

  try {
    return JSON.parse(raw);
  } catch {
    // Model occasionally wraps JSON in stray text despite json_object mode —
    // fall back to a safe reply rather than a 500 for the shopper.
    return { reply: raw.slice(0, 400), product_id: null };
  }
}
