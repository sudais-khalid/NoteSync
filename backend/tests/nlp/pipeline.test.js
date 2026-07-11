const { runClassicalPipeline } = require('../../services/nlp/pipeline');

const CLEAN_TRANSCRIPT = `Today we are going to talk about Newtonian mechanics. Isaac Newton was an English physicist and mathematician who lived in the seventeenth century. He is best known for formulating the laws of motion and the law of universal gravitation.

Newton's second law states that force equals mass times acceleration. This is one of the most important equations in classical physics.

Gravity is the force that attracts two bodies toward each other. Newton discovered that this force follows an inverse square law.

Momentum is defined as the product of an object's mass and velocity. Conservation of momentum is a fundamental principle that applies in collisions.

This topic is important for the upcoming exam.`;

const MESSY_TRANSCRIPT = `okay so um today we're gonna talk about like newtons laws right so basically force equals mass times acceleration thats the big one um isaac newton he was this english guy super smart`;

describe('runClassicalPipeline', () => {
  const result = runClassicalPipeline(CLEAN_TRANSCRIPT, 'Physics');

  test('returns every field the Lecture schema expects', () => {
    expect(typeof result.summary).toBe('string');
    expect(result.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(result.keyPoints)).toBe(true);
    expect(Array.isArray(result.definitions)).toBe(true);
    expect(Array.isArray(result.examTopics)).toBe(true);
    expect(['positive', 'neutral', 'critical', 'mixed']).toContain(result.sentiment);
    expect(Array.isArray(result.entities)).toBe(true);
    expect(Array.isArray(result.topics)).toBe(true);
    expect(typeof result.readabilityScore).toBe('number');
    expect(Array.isArray(result.flashcards)).toBe(true);
  });

  test('extracts real definitions from "X is Y" sentences', () => {
    const joined = result.definitions.join(' | ');
    expect(joined).toMatch(/Gravity:/);
    expect(joined).toMatch(/Momentum:/);
  });

  test('does not treat sentence-initial pronouns as definition terms', () => {
    for (const def of result.definitions) {
      expect(def).not.toMatch(/^(He|She|It|This|That|They|Today|There)\b/i);
    }
  });

  test('detects Isaac Newton as a person entity', () => {
    const person = result.annotations.entitySpans.find((e) => e.text === 'Isaac Newton');
    expect(person).toBeDefined();
    expect(person.type).toBe('PERSON');
  });

  test('entity span offsets slice back to the exact original text', () => {
    for (const span of result.annotations.entitySpans) {
      expect(CLEAN_TRANSCRIPT.slice(span.start, span.end)).toBe(span.text);
    }
  });

  test('key-term span offsets slice back to the exact original text', () => {
    for (const span of result.annotations.keyTermSpans) {
      expect(CLEAN_TRANSCRIPT.slice(span.start, span.end).toLowerCase()).toBe(span.text.toLowerCase());
    }
  });

  test('summary is extractive: every summary sentence appears in the transcript', () => {
    // Extractive summarization must never invent text.
    const sentences = result.summary.split(/(?<=\.)\s+/).filter(Boolean);
    for (const s of sentences) {
      expect(CLEAN_TRANSCRIPT).toContain(s.trim());
    }
  });

  test('flashcards are generated from extracted definitions', () => {
    expect(result.flashcards.length).toBeGreaterThan(0);
    const gravityCard = result.flashcards.find((c) => c.question.includes('Gravity'));
    expect(gravityCard).toBeDefined();
    expect(gravityCard.answer.length).toBeGreaterThan(0);
  });

  test('readability score is a plausible Flesch-Kincaid grade', () => {
    expect(result.readabilityScore).toBeGreaterThan(0);
    expect(result.readabilityScore).toBeLessThan(30);
  });

  test('topTfidfTerms rank domain words above stopwords', () => {
    const terms = result.annotations.topTfidfTerms.map((t) => t.term);
    expect(terms).toContain('force');
    expect(terms).not.toContain('the');
    expect(terms).not.toContain('and');
  });

  test('survives a messy no-punctuation ASR transcript without throwing', () => {
    const messy = runClassicalPipeline(MESSY_TRANSCRIPT, 'Physics');
    expect(typeof messy.summary).toBe('string');
    expect(messy.summary.length).toBeGreaterThan(0);
    for (const span of messy.annotations.entitySpans) {
      expect(MESSY_TRANSCRIPT.slice(span.start, span.end)).toBe(span.text);
    }
  });

  test('handles empty transcript without throwing', () => {
    const empty = runClassicalPipeline('', 'General');
    expect(empty.summary).toBe('');
    expect(empty.keyPoints).toEqual([]);
    expect(empty.readabilityScore).toBeNull();
  });
});
