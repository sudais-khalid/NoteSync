export default function LoadingSpinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center gap-2 text-ink-muted ${className}`} role="status">
      <span className="h-3.5 w-3.5 animate-pulse rounded-full border-2 border-amber border-t-transparent" />
      <span className="label-mono">{label}</span>
    </div>
  );
}
