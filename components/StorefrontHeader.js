// storefront top banner: logo, business name, whatsapp contact
import Image from 'next/image';
import clsx from 'clsx';
import { getFontFamily } from '@/lib/themePresets';

export default function StorefrontHeader({ vendor, mode = 'dark' }) {
  const { business_name, logo_url, whatsapp_number, theme_color, theme_font } = vendor;
  const isLight = mode === 'light';

  return (
    <header className="flex flex-col items-center gap-4 border-b border-line py-10 text-center">
      <div
        className={clsx(
          'flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border shadow-card',
          // Dark mode: a soft translucent white circle reads fine against a
          // deep background. Light mode needs a solid, opaque fill instead —
          // a faint tint here (what this used to be) has almost no contrast
          // against an already-pale page, so the circle basically disappears.
          isLight ? 'border-line bg-white' : 'border-line bg-white/60'
        )}
        style={{ borderColor: theme_color || undefined }}
      >
        {logo_url ? (
          <Image
            src={logo_url}
            alt={business_name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={clsx(
              'font-display text-2xl',
              // Same reasoning: dark mode's /40 white-on-black is a deliberate
              // soft touch, but the same amount of fade on dark-on-light text
              // reads as "barely there" instead of "subtle".
              isLight ? 'text-onLight/70' : 'text-ink/40'
            )}
          >
            {business_name?.charAt(0)?.toUpperCase()}
          </span>
        )}
      </div>

      <div>
        <h1
          className={clsx('font-display text-2xl', isLight ? 'text-onLight' : 'text-ink')}
          style={{ fontFamily: theme_font ? getFontFamily(theme_font) : undefined }}
        >
          {business_name}
        </h1>
        {whatsapp_number && (
          <p
            className={clsx(
              'mt-1 font-mono text-sm',
              isLight ? 'text-onLight/70' : 'text-ink/50'
            )}
          >
            {whatsapp_number}
          </p>
        )}
      </div>
    </header>
  );
}