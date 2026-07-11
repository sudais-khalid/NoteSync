const TONES = {
  teal: 'bg-teal-light text-teal-dark border-teal/30',
  amber: 'bg-amber-light text-amber-dark border-amber/30',
  rose: 'bg-rose-light text-rose border-rose/30',
  neutral: 'bg-ink/5 text-ink-muted border-hairline',
};

export default function Tag({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-xs ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
