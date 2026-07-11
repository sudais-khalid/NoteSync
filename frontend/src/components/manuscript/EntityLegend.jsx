export default function EntityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 border-b-2 border-dotted border-teal bg-teal-light" />
        entity
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 bg-amber-light" />
        key term
      </span>
    </div>
  );
}
