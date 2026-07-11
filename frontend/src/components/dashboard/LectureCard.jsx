import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Tag from '../common/Tag';

const SENTIMENT_TONE = { positive: 'teal', neutral: 'neutral', critical: 'rose', mixed: 'amber' };

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function LectureCard({ lecture, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(lecture._id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-5 transition-shadow hover:shadow-card-lifted">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-mono mb-1 truncate">{lecture.category} · {formatDate(lecture.date)}</p>
          <Link to={`/lectures/${lecture._id}`} className="block truncate font-display text-lg font-medium text-ink hover:text-teal-dark">
            {lecture.title}
          </Link>
          {lecture.subject && <p className="mt-0.5 truncate text-sm text-ink-muted">{lecture.subject}</p>}
        </div>
        <Tag tone={SENTIMENT_TONE[lecture.sentiment] || 'neutral'} className="shrink-0">
          {lecture.sentiment}
        </Tag>
      </div>

      <p className="line-clamp-2 text-sm text-ink-muted">{lecture.summary}</p>

      {lecture.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {lecture.tags.map((t) => (
            <Tag key={t} tone="neutral">{t}</Tag>
          ))}
        </div>
      )}

      <div className="mt-1 flex items-center justify-between border-t border-hairline pt-3">
        <Link to={`/lectures/${lecture._id}`} className="text-xs font-medium text-teal-dark hover:underline">
          Open lecture →
        </Link>

        {confirming ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-ink-muted">Delete this lecture?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="font-medium text-rose hover:underline disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="text-ink-muted hover:underline">
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-xs text-ink-faint hover:text-rose"
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
}
