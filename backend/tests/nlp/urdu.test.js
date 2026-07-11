const { isUrduToken, hasUrdu, isUrduStopword, normalizeSentenceMarks } = require('../../services/nlp/urduSupport');
const { tokenize } = require('../../services/nlp/tokenizer');
const tfidf = require('../../services/nlp/tfidf');
const notesComposer = require('../../services/nlp/notesComposer');
const { runClassicalPipeline } = require('../../services/nlp/pipeline');

const MIXED_TRANSCRIPT = `Gravity ek bohat important force hai. کشش ثقل وہ قوت ہے جو اجسام کو ایک دوسرے کی طرف کھینچتی ہے۔ Isaac Newton ne gravity ko discover kiya tha. Newton ka second law kehta hai ke force equals mass times acceleration. یہ فارمولا امتحان میں آئے گا۔ Momentum is defined as the product of mass and velocity. Momentum ki conservation ek fundamental principle hai.`;

describe('urduSupport', () => {
  test('detects Urdu script tokens and text', () => {
    expect(isUrduToken('قوت')).toBe(true);
    expect(isUrduToken('force')).toBe(false);
    expect(hasUrdu(MIXED_TRANSCRIPT)).toBe(true);
    expect(hasUrdu('English only text.')).toBe(false);
  });

  test('recognizes Urdu-script and Roman-Urdu stopwords', () => {
    expect(isUrduStopword('ہے')).toBe(true);
    expect(isUrduStopword('hai')).toBe(true);
    expect(isUrduStopword('bohat')).toBe(true);
    expect(isUrduStopword('gravity')).toBe(false);
    expect(isUrduStopword('قوت')).toBe(false);
  });

  test('normalizeSentenceMarks preserves string length exactly', () => {
    const normalized = normalizeSentenceMarks(MIXED_TRANSCRIPT);
    expect(normalized.length).toBe(MIXED_TRANSCRIPT.length);
    expect(normalized).toContain('.');
    expect(normalized).not.toContain('۔');
  });
});

describe('tokenizer with Urdu sentence marks', () => {
  test('splits sentences on the Urdu full stop ۔', () => {
    const text = 'پہلا جملہ ہے۔ دوسرا جملہ ہے۔';
    const { sentences } = tokenize(text);
    expect(sentences.length).toBe(2);
  });

  test('sentence spans slice the ORIGINAL text including ۔', () => {
    const { sentences, text } = tokenize(MIXED_TRANSCRIPT);
    for (const s of sentences) {
      expect(text.slice(s.start, s.end)).toBe(s.text);
    }
    // The Urdu sentences keep their original punctuation in the raw slices
    expect(sentences.some((s) => s.text.includes('۔'))).toBe(true);
  });
});

describe('tfidf with Urdu text', () => {
  test('tfidfTokens keeps Urdu words and drops bilingual stopwords', () => {
    const tokens = tfidf.tfidfTokens('کشش ثقل وہ قوت ہے jo gravity ki tarah hai');
    expect(tokens).toContain('کشش');
    expect(tokens).toContain('قوت');
    expect(tokens).toContain('gravity');
    expect(tokens).not.toContain('ہے'); // Urdu stopword
    expect(tokens).not.toContain('hai'); // Roman-Urdu stopword
  });

  test('Urdu terms receive TF-IDF scores (previously silently dropped)', () => {
    const { sentences } = tokenize(MIXED_TRANSCRIPT);
    const { topTerms } = tfidf.analyze(sentences);
    expect(topTerms.some((t) => isUrduToken(t.term))).toBe(true);
  });
});

describe('full pipeline on code-mixed transcript', () => {
  const result = runClassicalPipeline(MIXED_TRANSCRIPT, 'Physics');

  test('produces a non-empty summary and detailed notes', () => {
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.detailedNotes.length).toBeGreaterThan(0);
  });

  test('all span offsets still slice the raw mixed-script transcript exactly', () => {
    for (const span of result.annotations.entitySpans) {
      expect(MIXED_TRANSCRIPT.slice(span.start, span.end)).toBe(span.text);
    }
    for (const span of result.annotations.keyTermSpans) {
      expect(MIXED_TRANSCRIPT.slice(span.start, span.end).toLowerCase()).toBe(span.text.toLowerCase());
    }
  });
});

describe('notesComposer', () => {
  const sentences = [
    { index: 0, text: 'Gravity is the force that attracts two bodies.', start: 0, end: 0 },
    { index: 1, text: 'Gravity follows an inverse square law.', start: 0, end: 0 },
    { index: 2, text: 'Momentum is mass times velocity.', start: 0, end: 0 },
    { index: 3, text: 'Momentum is conserved in collisions.', start: 0, end: 0 },
    { index: 4, text: 'This will be on the exam next week.', start: 0, end: 0 },
  ];
  const topTerms = [
    { term: 'gravity', score: 5 },
    { term: 'momentum', score: 4 },
  ];

  const notes = notesComposer.compose({
    sentences,
    topTerms,
    summary: 'A lecture about gravity and momentum.',
    definitions: ['Gravity: the force that attracts two bodies.'],
    examTopics: ['gravity', 'momentum'],
  });

  test('starts with an overview section', () => {
    expect(notes[0]).toMatchObject({ heading: 'Overview' });
  });

  test('creates a section per salient topic with its sentences', () => {
    const gravity = notes.find((n) => n.heading === 'Gravity');
    expect(gravity).toBeDefined();
    expect(gravity.body).toContain('inverse square law');
    const momentum = notes.find((n) => n.heading === 'Momentum');
    expect(momentum).toBeDefined();
  });

  test('no sentence is repeated across topic sections', () => {
    const gravity = notes.find((n) => n.heading === 'Gravity');
    const momentum = notes.find((n) => n.heading === 'Momentum');
    expect(momentum.body).not.toContain('inverse square law');
    expect(gravity.body).not.toContain('conserved in collisions');
  });

  test('includes definitions and exam preparation sections', () => {
    expect(notes.some((n) => n.heading === 'Key terms & definitions')).toBe(true);
    const exam = notes.find((n) => n.heading === 'Exam preparation');
    expect(exam).toBeDefined();
    expect(exam.body).toContain('exam next week');
  });
});
