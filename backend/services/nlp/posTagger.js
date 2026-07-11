/**
 * Returns the full POS-tagged token stream with character offsets
 * (reusing the offset table already built by tokenizer.js).
 */
function tagAll(tokenOffsets) {
  return tokenOffsets.map((t) => ({ text: t.text, pos: t.pos, start: t.start, end: t.end }));
}

/**
 * Small representative sample for a "POS tagging" showcase widget —
 * intentionally not the full document, to keep the API payload light.
 */
function sample(tokenOffsets, sentences, sentenceCount = 3) {
  if (sentences.length === 0) return [];
  const lastSentence = sentences[Math.min(sentenceCount, sentences.length) - 1];
  return tokenOffsets.filter((t) => t.end <= lastSentence.end);
}

module.exports = { tagAll, sample };
