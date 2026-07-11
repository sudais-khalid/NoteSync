/**
 * Template-based flashcard generation from definitions and key sentences.
 * Mechanically phrased compared to an LLM's output — a strong candidate
 * for Gemini enrichment (prompt polish) when a key is configured.
 */
function generate(definitions, keyPoints, limit = 8) {
  const cards = [];

  for (const def of definitions) {
    const separatorIndex = def.indexOf(':');
    if (separatorIndex === -1) continue;
    const term = def.slice(0, separatorIndex).trim();
    const answer = def.slice(separatorIndex + 1).trim();
    if (term && answer) cards.push({ question: `What is ${term}?`, answer });
    if (cards.length >= limit) break;
  }

  for (const point of keyPoints) {
    if (cards.length >= limit) break;
    const words = point.split(/\s+/);
    if (words.length < 6) continue;
    const clauseEnd = Math.min(8, words.length - 3);
    cards.push({ question: `Explain: ${words.slice(0, clauseEnd).join(' ')}...`, answer: point });
  }

  return cards.slice(0, limit);
}

module.exports = { generate };
