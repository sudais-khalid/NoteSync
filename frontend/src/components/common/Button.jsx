const VARIANTS = {
  primary: 'bg-ink text-paper hover:bg-ink/90 border-ink',
  amber: 'bg-amber text-paper hover:bg-amber-dark border-amber-dark',
  ghost: 'bg-transparent text-ink hover:bg-ink/5 border-transparent',
  outline: 'bg-transparent text-ink hover:bg-ink/5 border-hairline',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-sm border px-4 py-2 font-sans text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
