import clsx from 'clsx';

export default function Input({ label, id, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="font-body text-xs font-medium uppercase tracking-wider text-ink/60">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'rounded-full border border-line bg-transparent px-4 py-2.5 font-body text-ink',
          'placeholder:text-ink/40',
          'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}