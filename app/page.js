'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import PhoneMockup from '@/components/PhoneMockup';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const steps = [
  {
    n: '01',
    title: 'Sign up',
    body: 'Pick your store name and link. Takes under a minute — no verification, no waiting.',
  },
  {
    n: '02',
    title: 'Add products',
    body: 'Name, price, a photo. Your storefront updates the moment you save.',
  },
  {
    n: '03',
    title: 'Share your link',
    body: 'Drop it in your WhatsApp status, bio, or group. Every visit is one tap from an order.',
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* ---------- Hero ---------- */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-16 px-6 pb-24 pt-20 md:flex-row md:items-center md:pt-28">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="max-w-xl text-center md:text-left"
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-jade"
          >
            WhatsApp-native storefronts
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl leading-[1.05] text-ink sm:text-5xl md:text-6xl"
          >
            Your shop.
            <br />
            On WhatsApp.
            <br />
            <span className="text-jade">In 5 minutes.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-lg leading-relaxed text-ink/70">
            Give your customers a real storefront to browse — and let every order land
            straight in your WhatsApp chat. No app to install, no account for them to make.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-col items-center gap-3 sm:flex-row md:items-start">
            <Button as={Link} href="/signup" variant="primary" size="lg">
              Get started — it&apos;s free
            </Button>
            <Button as={Link} href="#how-it-works" variant="ghost" size="lg">
              See how it works
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        >
          <PhoneMockup />
        </motion.div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="border-y border-line bg-white/[0.03] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="mx-auto mb-16 max-w-xl text-center"
          >
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              Three steps. That&apos;s the whole setup.
            </h2>
          </motion.div>

          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.5 }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <span className="font-mono text-sm text-marigold">{step.n}</span>
                <h3 className="mt-3 font-display text-xl text-ink">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-ink/70">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Customer-side reassurance ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            Your customers don&apos;t sign up for anything.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            They browse your storefront, tap a product, and WhatsApp opens with their order
            already typed out. No forms, no passwords — just a message to you, the way they&apos;d
            already reach out.
          </p>
        </motion.div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="bg-jade py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center"
        >
          <h2 className="font-display text-3xl text-paper sm:text-4xl">
            Ready to open your store?
          </h2>
          <Button as={Link} href="/signup" variant="marigold" size="lg">
            Get started — it&apos;s free
          </Button>
        </motion.div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-ink/50 sm:flex-row">
          <p className="font-display text-ink">yourstore.ng</p>
          <p>&copy; {new Date().getFullYear()} Vendor Storefront. Built for vendors across Nigeria.</p>
        </div>
      </footer>
    </main>
  );
}
