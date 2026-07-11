import { buildHighlightSegments } from './spanHighlighter';

const TEXT = 'Isaac Newton discovered gravity in England. Force equals mass times acceleration.';

describe('buildHighlightSegments', () => {
  test('segments reconstruct the original text exactly with no gaps', () => {
    const segments = buildHighlightSegments(
      TEXT,
      [{ text: 'Isaac Newton', type: 'PERSON', start: 0, end: 12 }],
      [{ text: 'gravity', score: 5, start: 24, end: 31 }]
    );
    expect(segments.map((s) => s.text).join('')).toBe(TEXT);
    for (let i = 1; i < segments.length; i += 1) {
      expect(segments[i].start).toBe(segments[i - 1].end);
    }
    expect(segments[0].start).toBe(0);
    expect(segments[segments.length - 1].end).toBe(TEXT.length);
  });

  test('entity spans win over overlapping key-term spans', () => {
    const segments = buildHighlightSegments(
      TEXT,
      [{ text: 'Isaac Newton', type: 'PERSON', start: 0, end: 12 }],
      [{ text: 'Newton', score: 4, start: 6, end: 12 }]
    );
    expect(segments.some((s) => s.kind === 'entity' && s.text === 'Isaac Newton')).toBe(true);
    expect(segments.some((s) => s.kind === 'keyterm')).toBe(false);
  });

  test('drops spans that run past the end of the text', () => {
    const segments = buildHighlightSegments(TEXT, [{ text: 'x', type: 'ORG', start: 70, end: 999 }], []);
    expect(segments).toHaveLength(1);
    expect(segments[0].kind).toBe('plain');
  });

  test('handles empty text and empty span lists', () => {
    expect(buildHighlightSegments('', [], [])).toEqual([]);
    const plainOnly = buildHighlightSegments('hello world', [], []);
    expect(plainOnly).toHaveLength(1);
    expect(plainOnly[0]).toMatchObject({ kind: 'plain', text: 'hello world' });
  });

  test('marks are ordered by position regardless of input order', () => {
    const segments = buildHighlightSegments(
      TEXT,
      [{ text: 'England', type: 'PLACE', start: 35, end: 42 }],
      [{ text: 'Isaac', score: 1, start: 0, end: 5 }]
    );
    const marks = segments.filter((s) => s.kind !== 'plain');
    expect(marks[0].text).toBe('Isaac');
    expect(marks[1].text).toBe('England');
  });
});
