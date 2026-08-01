import clsx from 'clsx';

export default function Input({ label, id, error, className, icon: Icon, trailing, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="font-body text-xs font-medium uppercase tracking-wider text-ink/60">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && <Icon className="pointer-events-none absolute left-4 h-4 w-4 text-ink/40" />}
        <input
          id={id}
          className={clsx(
            'w-full rounded-full border border-line bg-transparent py-2.5 font-body text-ink',
            Icon ? 'pl-11' : 'px-4',
            trailing ? 'pr-11' : !Icon && 'px-4',
            Icon && !trailing && 'pr-4',
            'placeholder:text-ink/40',
            'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade',
            error && 'border-red-400',
            className
          )}
          {...props}
        />
        {trailing && <div className="absolute right-4 flex items-center">{trailing}</div>}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}