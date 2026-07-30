import clsx from 'clsx';

const variants = {
  primary: 'bg-jade text-paper hover:bg-jade-light shadow-card',
  marigold: 'bg-marigold text-onMarigold hover:brightness-105 shadow-card',
  ghost: 'bg-transparent text-ink border border-line hover:border-ink',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-card',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-body font-medium',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}