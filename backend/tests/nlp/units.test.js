const { tokenize } = require('../../services/nlp/tokenizer');
const definitionExtractor = require('../../services/nlp/definitionExtractor');
const sentimentAnalyzer = require('../../services/nlp/sentimentAnalyzer');
const readability = require('../../services/nlp/readability');
const flashcardGenerator = require('../../services/nlp/flashcardGenerator');
const summarizer = require('../../services/nlp/summarizer');
const tfidf = require('../../services/nlp/tfidf');

describe('tokenizer', () => {
  test('token offsets reconstruct the original string exactly', () => {
    const text = 'Isaac Newton discovered gravity.  It was  surprising!';
    const { tokenOffsets } = tokenize(text);
    for (const t of tokenOffsets) {
      expect(text.slice(t.start, t.end)).toBe(t.text);
    }
  });

  test('sentence spans slice back to sentence text', () => {
    const text = 'First sentence here. Second sentence follows. Third one ends.';
    const { sentences } = tokenize(text);
    expect(sentences).toHaveLength(3);
    for (const s of sentences) {
      expect(text.slice(s.start, s.end)).toBe(s.text);
    }
  });

  test('every token carries a POS tag', () => {
    const { tokenOffsets } = tokenize('Newton formulated three laws.');
    expect(tokenOffsets.length).toBeGreaterThan(0);
    for (const t of tokenOffsets) {
      expect(typeof t.pos).toBe('string');
      expect(t.pos.length).toBeGreaterThan(0);
    }
  });
});

describe('definitionExtractor', () => {
  const toSentences = (texts) => texts.map((text, index) => ({ index, text, start: 0, end: 0 }));

  test('extracts "X is Y" patterns', () => {
    const defs = definitionExtractor.extract(
      toSentences(['Photosynthesis is the process by which plants convert light into energy.'])
    );
    expect(defs).toHaveLength(1);
    expect(defs[0]).toMatch(/^Photosynthesis:/);
  });

  test('rejects pronoun subjects', () => {
    const defs = definitionExtractor.extract(
      toSentences(['It is the process by which plants convert light into energy.', 'This is one of the most important topics.'])
    );
    expect(defs).toHaveLength(0);
  });

  test('respects the limit', () => {
    const many = Array.from({ length: 20 }, (_, i) => `Term${i} is a concept number ${i} in the lecture.`);
    const defs = definitionExtractor.extract(toSentences(many), 5);
    expect(defs).toHaveLength(5);
  });
});

describe('sentimentAnalyzer', () => {
  const toSentences = (texts) => texts.map((text, index) => ({ index, text, start: 0, end: 0 }));

  test('classifies clearly positive text as positive', () => {
    expect(
      sentimentAnalyzer.analyze(toSentences(['This is a wonderful, excellent and inspiring discovery that delights everyone.']))
    ).toBe('positive');
  });

  test('classifies clearly negative text as critical', () => {
    expect(
      sentimentAnalyzer.analyze(toSentences(['This is a terrible, awful failure and a disastrous mistake.']))
    ).toBe('critical');
  });

  test('classifies factual text as neutral', () => {
    expect(
      sentimentAnalyzer.analyze(toSentences(['Water consists of hydrogen and oxygen atoms.']))
    ).toBe('neutral');
  });

  test('classifies strongly contrasting sentences as mixed', () => {
    expect(
      sentimentAnalyzer.analyze(toSentences([
        'This is a wonderful, excellent and inspiring discovery.',
        'That was a terrible, awful and disastrous failure.',
      ]))
    ).toBe('mixed');
  });

  test('returns neutral for empty input', () => {
    expect(sentimentAnalyzer.analyze([])).toBe('neutral');
  });
});

describe('readability', () => {
  test('returns numeric scores for real text', () => {
    const { readabilityScore, fleschReadingEase } = readability.score(
      'The quick brown fox jumps over the lazy dog. Simple sentences are easy to read.'
    );
    expect(typeof readabilityScore).toBe('number');
    expect(typeof fleschReadingEase).toBe('number');
  });

  test('returns nulls for empty text', () => {
    const { readabilityScore, fleschReadingEase } = readability.score('');
    expect(readabilityScore).toBeNull();
    expect(fleschReadingEase).toBeNull();
  });
});

describe('flashcardGenerator', () => {
  test('builds "What is X?" cards from definitions', () => {
    const cards = flashcardGenerator.generate(['Gravity: the force that attracts two bodies.'], []);
    expect(cards).toHaveLength(1);
    expect(cards[0].question).toBe('What is Gravity?');
    expect(cards[0].answer).toBe('the force that attracts two bodies.');
  });

  test('falls back to key-point cards and respects the cap', () => {
    const keyPoints = Array.from({ length: 12 }, (_, i) =>
      `Important concept number ${i} explains how systems interact with each other over time.`
    );
    const cards = flashcardGenerator.generate([], keyPoints, 8);
    expect(cards.length).toBeLessThanOrEqual(8);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].question).toMatch(/^Explain:/);
  });
});

describe('summarizer + tfidf', () => {
  test('selected sentences keep original document order', () => {
    const texts = [
      'Newton studied physics and mathematics in Cambridge during the plague years.',
      'The weather was nice.',
      'Force equals mass times acceleration in classical Newtonian physics.',
      'He liked apples.',
      'Gravity follows an inverse square law according to Newtonian physics.',
    ];
    const sentences = texts.map((text, index) => ({ index, text, start: 0, end: 0 }));
    const { sentenceScores } = tfidf.analyze(sentences);
    const { selectedSentenceIndices } = summarizer.extract(sentences, sentenceScores);
    const sorted = [...selectedSentenceIndices].sort((a, b) => a - b);
    expect(selectedSentenceIndices).toEqual(sorted);
  });

  test('empty input yields empty summary', () => {
    const { summary, selectedSentenceIndices } = summarizer.extract([], []);
    expect(summary).toBe('');
    expect(selectedSentenceIndices).toEqual([]);
  });
});
