// storefront top banner: logo, business name, whatsapp contact
import clsx from 'clsx';
import Image from 'next/image';
import { getFontFamily } from '@/lib/themePresets';

export default function StorefrontHeader({ vendor, mode = 'dark' }) {
  const { business_name, logo_url, whatsapp_number, theme_color, theme_font } = vendor;
  const isLight = mode === 'light';

  return (
    <header className="relative flex flex-col items-center gap-4 overflow-hidden py-10 text-center">
      {/* Subtle full-bleed echo of the logo behind the header — keeps the
          header from looking bare when a vendor uploads a wide/non-square
          image, without affecting the always-cropped square slot below. */}
      {logo_url && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            backgroundImage: `url(${logo_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px)',
            transform: 'scale(1.2)',
            opacity: isLight ? 0.12 : 0.2,
          }}
        />
      )}
      <div className="relative z-10">
        <div
          className={clsx(
            'flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl shadow-card',
            isLight ? 'bg-white' : 'bg-white/10'
          )}
          style={{ backgroundColor: logo_url ? undefined : theme_color || undefined }}
        >
          {logo_url ? (
            <Image src={logo_url} alt={business_name} width={80} height={80} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-2xl text-onMarigold">
              {business_name?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <h1
        className={clsx('relative z-10 font-display text-2xl', isLight ? 'text-onLight' : 'text-ink')}
        style={{ fontFamily: theme_font ? getFontFamily(theme_font) : undefined }}
      >
        {business_name}
      </h1>

      {whatsapp_number && (
        <a
          href={`https://wa.me/${whatsapp_number.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'relative z-10 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm',
            isLight ? 'border-line text-onLight/80' : 'border-line text-ink/80'
          )}
        >
          {whatsapp_number}
        </a>
      )}
    </header>
  );
}