// empty state placeholder (no products yet, etc.)
import Link from 'next/link';
import clsx from 'clsx';
import Button from './Button';

export default function EmptyState({ title, description, actionLabel, actionHref, mode = 'dark' }) {
  const isLight = mode === 'light';

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <h3 className={clsx('font-display text-xl', isLight ? 'text-onLight' : 'text-ink')}>
        {title}
      </h3>
      {description && (
        <p className={clsx('mt-2 max-w-sm text-sm', isLight ? 'text-onLight/60' : 'text-ink/60')}>
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Button as={Link} href={actionHref} variant="marigold" size="md" className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}