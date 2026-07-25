'use client';

import { motion } from 'framer-motion';

// Mock storefront content used only for the marketing homepage —
// not real vendor data. Fabric-swatch color blocks stand in for
// product photos so the mockup doesn't depend on stock images.
const MOCK_PRODUCTS = [
  { name: 'Ankara Wrap Dress', price: '18,500', swatch: 'from-[#F2A93B] to-[#E8842B]' },
  { name: 'Beaded Clutch', price: '9,000', swatch: 'from-[#145C4B] to-[#0F2A24]' },
  { name: 'Aso-Oke Head Wrap', price: '6,500', swatch: 'from-[#1E8A73] to-[#145C4B]' },
  { name: 'Woven Sandals', price: '12,000', swatch: 'from-[#E8842B] to-[#0F2A24]' },
];

export default function PhoneMockup({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* soft gradient blob behind the phone */}
      <div
        aria-hidden
        className="absolute -inset-16 -z-10 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, #F2A93B 0%, transparent 55%), radial-gradient(circle at 70% 80%, #1E8A73 0%, transparent 55%)',
        }}
      />

      {/* phone frame */}
      <div className="relative mx-auto w-[280px] rounded-[2.5rem] border-[10px] border-black bg-black shadow-soft">
        <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-black" />

        <div className="relative h-[560px] overflow-hidden rounded-[1.75rem] bg-paper">
          {/* mini storefront header */}
          <div className="flex items-center gap-2 border-b border-line bg-white/70 px-4 py-3">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-marigold to-jade" />
            <div>
              <p className="font-display text-sm leading-tight text-onLight">Amaka&apos;s Closet</p>
              <p className="text-[11px] text-onLight/50">yoursite.ng/store/amakas-closet</p>
            </div>
          </div>

          {/* product grid, gently drifting to feel alive */}
          <motion.div
            className="grid grid-cols-2 gap-2.5 p-3"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {MOCK_PRODUCTS.map((p) => (
              <div key={p.name} className="overflow-hidden rounded-xl border border-line bg-white">
                <div className={`aspect-square w-full bg-gradient-to-br ${p.swatch}`} />
                <div className="p-2">
                  <p className="truncate text-[11px] font-medium text-onLight">{p.name}</p>
                  <p className="font-mono text-[11px] text-jade">₦{p.price}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* the signature moment: a WhatsApp order bubble animating out
              of a product card, demonstrating the core product mechanic */}
          <motion.div
            className="absolute bottom-6 left-3 right-3 rounded-2xl bg-white p-3 shadow-card"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: [0, 1, 1, 0], y: [16, 0, 0, -6], scale: [0.96, 1, 1, 1] }}
            transition={{
              duration: 4,
              times: [0, 0.2, 0.8, 1],
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: 'easeOut',
            }}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jade">
                <svg viewBox="0 0 24 24" fill="white" className="h-3.5 w-3.5">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.39a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.1c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.14-.95-.32-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36l.55.01c.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.15.12.32.02.51-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.27.71 1.17 1.52 1.89 1.05.93 1.93 1.22 2.2 1.36.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.37-.22.61-.13.24.09 1.55.73 1.82.87.27.13.44.19.51.3.07.11.07.62-.17 1.3z" />
                </svg>
              </div>
              <p className="text-[11px] leading-snug text-onLight/80">
                Hi! I&apos;d like to order:
                <br />
                <span className="font-medium text-onLight">Ankara Wrap Dress — ₦18,500</span>
                <br />
                <span className="text-onLight/50">(via Amaka&apos;s Closet)</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}