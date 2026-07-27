// storefront top banner: logo, business name, whatsapp contact// storefront top banner: logo, business name, whatsapp contact
import Image from 'next/image';

export default function StorefrontHeader({ vendor }) {
  const { business_name, logo_url, whatsapp_number, theme_color } = vendor;

  return (
    <header className="flex flex-col items-center gap-4 border-b border-line py-10 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-line bg-white/60"
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
          <span className="font-display text-2xl text-ink/40">
            {business_name?.charAt(0)?.toUpperCase()}
          </span>
        )}
      </div>

      <div>
        <h1 className="font-display text-2xl text-ink">{business_name}</h1>
        {whatsapp_number && (
          <p className="mt-1 font-mono text-sm text-ink/50">{whatsapp_number}</p>
        )}
      </div>
    </header>
  );
}
