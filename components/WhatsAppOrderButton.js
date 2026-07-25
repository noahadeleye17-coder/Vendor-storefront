'use client';

import { buildWhatsAppOrderLink } from '@/lib/whatsappLink';

// MessageCircle icon inlined (no lucide-react dependency needed for one glyph
// keeps this component usable standalone in the homepage mockup too).
function WhatsAppGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.39a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.1c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11a16.4 16.4 0 0 1-1.65-.61c-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36l.55.01c.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.15.12.32.02.51-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.27.71 1.17 1.52 1.89 1.05.93 1.93 1.22 2.2 1.36.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.37-.22.61-.13.24.09 1.55.73 1.82.87.27.13.44.19.51.3.07.11.07.62-.17 1.3z" />
    </svg>
  );
}

export default function WhatsAppOrderButton({
  whatsappNumber,
  productName,
  price,
  storeName,
  className = '',
}) {
  const href = buildWhatsAppOrderLink({ whatsappNumber, productName, price, storeName });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-jade px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-jade-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${className}`}
    >
      <WhatsAppGlyph className="h-4 w-4" />
      Order on WhatsApp
    </a>
  );
}
