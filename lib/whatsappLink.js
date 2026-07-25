// Builds the wa.me deep link used by the "Order via WhatsApp" button.
// Keeping this pure and dependency-free makes it easy to unit test.

export function buildWhatsAppOrderLink({ whatsappNumber, productName, price, storeName }) {
  // wa.me requires digits only, no leading +
  const digits = whatsappNumber.replace(/\D/g, '');

  const message =
    `Hi! I'd like to order:\n` +
    `${productName} — ₦${formatPrice(price)}\n` +
    `(via ${storeName})`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(value) {
  return Number(value).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}
