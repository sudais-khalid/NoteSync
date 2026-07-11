import Card from '../common/Card';
import Tag from '../common/Tag';

export default function MarginNote({ span, definitions }) {
  if (!span) {
    return (
      <Card className="p-4 text-sm text-ink-muted">
        <p className="label-mono mb-1">margin note</p>
        Click a highlighted term in the transcript to see what the NLP pipeline detected.
      </Card>
    );
  }

  const relatedDefinition = (definitions || []).find((d) =>
    d.toLowerCase().startsWith(span.text.trim().toLowerCase())
  );

  return (
    <Card className="p-4">
      <p className="label-mono mb-2">margin note</p>
      <p className="font-display text-lg font-medium leading-snug">{span.text.trim()}</p>

      <div className="mt-2">
        {span.kind === 'entity' ? (
          <Tag tone="teal">entity · {span.type?.toLowerCase()}</Tag>
        ) : (
          <Tag tone="amber">key term · tf-idf {span.score?.toFixed(2)}</Tag>
        )}
      </div>

      {relatedDefinition && (
        <p className="mt-3 text-sm text-ink-muted">{relatedDefinition.split(':').slice(1).join(':').trim()}</p>
      )}
    </Card>
  );
}
