// storefront top banner: logo, business name, whatsapp contact
import clsx from 'clsx';
import Image from 'next/image';
import { getFontFamily } from '@/lib/themePresets';
import LogoUploader from './LogoUploader';

export default function StorefrontHeader({ vendor, mode = 'dark', isOwner = false }) {
  const { id, business_name, logo_url, whatsapp_number, theme_color, theme_font } = vendor;
  const isLight = mode === 'light';

  return (
    <header className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="relative">
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
        {isOwner && <LogoUploader vendorId={id} />}
      </div>

      <h1
        className={clsx('font-display text-2xl', isLight ? 'text-onLight' : 'text-ink')}
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
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm',
            isLight ? 'border-line text-onLight/80' : 'border-line text-ink/80'
          )}
        >
          {whatsapp_number}
        </a>
      )}
    </header>
  );
}