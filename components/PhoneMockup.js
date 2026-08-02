'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

// Hero image: a hand holding a phone showing the real vendor dashboard.
// Replaced the illustrated animated mockup with this photographic version
// for a more premium landing-page feel. Source PNG already has a
// transparent background so it drops straight onto the page's dark
// gradient without needing its own background treatment.
export default function PhoneMockup({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {/* soft gradient blob behind the phone — same warm glow as before,
          now doubling as the "environment light" the hand photo was shot in */}
      <div
        aria-hidden
        className="absolute -inset-16 -z-10 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, #F2A93B 0%, transparent 55%), radial-gradient(circle at 70% 80%, #1E8A73 0%, transparent 55%)',
        }}
      />

      <motion.div
        className="relative mx-auto w-[280px] sm:w-[320px]"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src="/images/hand-phone-hero.png"
          alt="A hand holding a phone showing the ShopLink vendor dashboard"
          width={958}
          height={1385}
          priority
          className="h-auto w-full drop-shadow-2xl"
        />
      </motion.div>
    </div>
  );
}
