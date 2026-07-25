// empty state placeholder (no products yet, etc.)
import Link from 'next/link';
import Button from './Button';

export default function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-ink/60">{description}</p>}
      {actionLabel && actionHref && (
        <Button as={Link} href={actionHref} variant="marigold" size="md" className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}