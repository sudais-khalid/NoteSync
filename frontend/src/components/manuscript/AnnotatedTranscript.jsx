import { buildHighlightSegments } from '../../utils/spanHighlighter';

const MARK_STYLES = {
  entity: 'bg-teal-light text-teal-dark decoration-teal decoration-dotted underline underline-offset-2 cursor-pointer hover:bg-teal/30',
  keyterm: 'bg-amber-light text-amber-dark cursor-pointer hover:bg-amber/30',
};

export default function AnnotatedTranscript({ text, entitySpans, keyTermSpans, activeSpanKey, onSelectSpan }) {
  const segments = buildHighlightSegments(text || '', entitySpans || [], keyTermSpans || []);

  return (
    <p dir="auto" className="urdu-capable whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink">
      {segments.map((seg, i) => {
        if (seg.kind === 'plain') {
          // eslint-disable-next-line react/no-array-index-key
          return <span key={i}>{seg.text}</span>;
        }
        const key = `${seg.kind}-${seg.start}-${seg.end}`;
        const isActive = key === activeSpanKey;
        return (
          <mark
            key={key}
            className={`rounded-none px-0.5 ${MARK_STYLES[seg.kind]} ${isActive ? 'ring-2 ring-ink/40' : ''}`}
            onClick={() => onSelectSpan({ ...seg, key })}
          >
            {seg.text}
          </mark>
        );
      })}
    </p>
  );
}
