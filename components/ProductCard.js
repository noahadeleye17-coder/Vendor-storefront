import clsx from 'clsx';
import Image from 'next/image';
import { formatPrice } from '@/lib/whatsappLink';
import WhatsAppOrderButton from './WhatsAppOrderButton';

export default function ProductCard({ product, whatsappNumber, storeName, mode = 'dark' }) {
  const { name, price, photo_url, in_stock } = product;
  const isLight = mode === 'light';

  return (
    <div
      className={clsx(
        'group flex flex-col overflow-hidden rounded-2xl border border-line backdrop-blur-sm transition-shadow hover:shadow-card',
        isLight ? 'bg-white/60' : 'bg-white/5'
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-line">
        {photo_url ? (
          <Image
            src={photo_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/30 font-display text-sm">
            No photo
          </div>
        )}
        {in_stock ? (
          <span className="absolute left-2 top-2 rounded-full bg-jade/90 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-paper">
            In stock
          </span>
        ) : (
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-xs text-paper font-body">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className={clsx('font-display text-base leading-snug', isLight ? 'text-onLight' : 'text-ink')}>
            {name}
          </h3>
          <p className="mt-1 font-mono text-sm text-jade">₦{formatPrice(price)}</p>
        </div>

        {in_stock && (
          <WhatsAppOrderButton
            whatsappNumber={whatsappNumber}
            productName={name}
            price={price}
            storeName={storeName}
            className="mt-auto w-full"
          />
        )}
      </div>
    </div>
  );
}