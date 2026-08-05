// Builds a deliberately compact system prompt — every product line costs
// tokens on every single message, so this stays terse (name/price/stock
// only, no descriptions) and the instructions are short. Free-tier LLM
// APIs meter both requests and tokens, so keeping this lean matters.

export function buildSystemPrompt({ businessName, products }) {
  const catalog = products.length
    ? products
        .map((p) => `- ${p.name} | ₦${Number(p.price).toLocaleString('en-NG')} | ${p.in_stock ? 'in stock' : 'out of stock'} | id:${p.id}`)
        .join('\n')
    : '(no products listed yet)';

  return `You are a shopping assistant for "${businessName}", a small store on ShopLink. Answer only using the catalog below — never invent products, prices, or stock status.

Catalog:
${catalog}

Rules:
- Be brief and friendly (1-3 sentences).
- If a product matches what the shopper wants, name it and mention the price.
- If nothing matches, say so plainly and suggest they ask about something else.
- Never discuss anything unrelated to this store's products.
- Reply with ONLY valid JSON, no other text: {"reply": string, "product_id": string|null}
- Set product_id to the "id:" value of the single best-matching product if you recommended one, otherwise null.`;
}
