/**
 * Key points: highest-salience sentences NOT already used in the summary,
 * restored to original order so they read naturally as a list.
 */
function extractKeyPoints(sentences, sentenceScores, excludeIndices, limit = 8) {
  const excluded = new Set(excludeIndices);
  const ranked = [...sentenceScores]
    .filter((s) => !excluded.has(s.sentenceIndex))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .sort((a, b) => a.sentenceIndex - b.sentenceIndex);

  return ranked.map((r) => sentences[r.sentenceIndex].text.trim()).filter(Boolean);
}

/** Topics: top TF-IDF terms taken as short topic-cluster labels. */
function extractTopics(topTerms, limit = 5) {
  return topTerms.slice(0, limit).map((t) => t.term);
}

/**
 * examTopics has no clean classical equivalent to "likely to be tested."
 * Approximated with a repetition + salience heuristic: prefer top TF-IDF
 * terms that also co-occur with an extracted definition or named entity,
 * since those are more likely to be the substantive, testable concepts
 * rather than incidental high-frequency words.
 */
function extractExamTopics(topTerms, definitions, entities, limit = 5) {
  const definitionText = definitions.join(' ').toLowerCase();
  const entityTexts = new Set(entities.map((e) => e.text.toLowerCase()));

  const salient = topTerms.filter(
    (t) => definitionText.includes(t.term) || entityTexts.has(t.term)
  );

  const chosen = (salient.length ? salient : topTerms).slice(0, limit);
  return chosen.map((t) => t.term);
}

module.exports = { extractKeyPoints, extractTopics, extractExamTopics };
