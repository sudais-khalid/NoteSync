function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-2.5 py-1 font-mono text-xs transition-colors ${
        active
          ? 'border-teal bg-teal text-paper'
          : 'border-hairline bg-paper-raised text-ink-muted hover:border-teal/50 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ categories, tags, activeCategory, activeTag, onCategoryChange, onTagChange }) {
  if (categories.length === 0 && tags.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono mr-1">category</span>
          <Chip active={!activeCategory} onClick={() => onCategoryChange('')}>all</Chip>
          {categories.map((c) => (
            <Chip key={c.name} active={activeCategory === c.name} onClick={() => onCategoryChange(c.name)}>
              {c.name} · {c.count}
            </Chip>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono mr-1">tag</span>
          <Chip active={!activeTag} onClick={() => onTagChange('')}>all</Chip>
          {tags.map((t) => (
            <Chip key={t.name} active={activeTag === t.name} onClick={() => onTagChange(t.name)}>
              {t.name} · {t.count}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
