/**
 * Merges entity spans and key-term spans (character offsets into the raw
 * transcript) into a flat, non-overlapping, gap-free list of segments
 * covering the whole text. Entity spans win over overlapping key-term spans
 * so we never nest <mark> tags. Pure function over immutable offset data —
 * never re-tokenizes, so highlights can't desync from the raw transcript.
 */
function spansOverlap(a, b) {
  return a.start < b.end && b.start < a.end;
}

export function buildHighlightSegments(text, entitySpans = [], keyTermSpans = []) {
  const entities = [...entitySpans]
    .filter((s) => s.start < s.end && s.end <= text.length)
    .sort((a, b) => a.start - b.start);

  const keyTerms = [...keyTermSpans]
    .filter((s) => s.start < s.end && s.end <= text.length)
    .filter((k) => !entities.some((e) => spansOverlap(e, k)))
    .sort((a, b) => a.start - b.start);

  const marks = [...entities.map((s) => ({ ...s, kind: 'entity' })), ...keyTerms.map((s) => ({ ...s, kind: 'keyterm' }))].sort(
    (a, b) => a.start - b.start
  );

  const segments = [];
  let cursor = 0;

  for (const mark of marks) {
    if (mark.start < cursor) continue; // guard against any residual overlap within the same kind
    if (mark.start > cursor) {
      segments.push({ start: cursor, end: mark.start, kind: 'plain', text: text.slice(cursor, mark.start) });
    }
    segments.push({ ...mark, text: text.slice(mark.start, mark.end) });
    cursor = mark.end;
  }

  if (cursor < text.length) {
    segments.push({ start: cursor, end: text.length, kind: 'plain', text: text.slice(cursor) });
  }

  return segments;
}
