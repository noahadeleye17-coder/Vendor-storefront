import Image from 'next/image';

// Desktop-only decorative panel for the login/signup pages — same hand +
// phone hero image used on the landing page, giving a consistent, more
// premium first impression on the way in. Hidden below the lg breakpoint;
// mobile keeps the plain centered form.
export default function AuthSidePanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-[42%] lg:shrink-0 lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-[#0F2A24] lg:to-[#0A1F1A]">
      <div
        aria-hidden
        className="absolute -inset-24 opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, #F2A93B 0%, transparent 55%), radial-gradient(circle at 70% 80%, #1E8A73 0%, transparent 55%)',
        }}
      />

      <div className="relative w-[70%] max-w-sm">
        <Image
          src="/images/hand-phone-hero.png"
          alt="A hand holding a phone showing the ShopLink vendor dashboard"
          width={958}
          height={1385}
          className="h-auto w-full drop-shadow-2xl"
        />
      </div>

      <div className="absolute bottom-12 left-0 right-0 px-10 text-center">
        <p className="font-display text-xl leading-snug text-paper">
          Your shop, open on WhatsApp.
        </p>
        <p className="mt-2 text-sm text-paper/60">
          Manage products and orders from your phone, in minutes.
        </p>
      </div>
    </div>
  );
}
