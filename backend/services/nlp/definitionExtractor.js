/**
 * Rule-based definition extraction. Weakest classical stage: real ASR
 * transcripts rarely contain clean "X is/means Y" phrasing, so expect low
 * recall here — this is exactly where Gemini enrichment adds the most value.
 */
const DEFINITION_PATTERNS = [
  /^([A-Z][\w\s-]{1,40}?)\s+(?:is|are|means|refers to|is defined as|is known as)\s+(.{5,300})$/i,
  /^([A-Z][\w\s-]{1,40}):\s+(.{5,300})$/,
];

// Sentence-initial capitalized pronouns/function words aren't "terms" —
// filtering these out is what separates real definitions ("Gravity is...")
// from incidental sentence structure ("It means...", "This is...").
const NON_TERM_STARTERS = new Set([
  'this', 'that', 'these', 'those', 'it', 'he', 'she', 'they', 'we', 'i',
  'today', 'there', 'here', 'what', 'which', 'who', 'the', 'a', 'an',
]);

function isPlausibleTerm(term) {
  const firstWord = term.split(/\s+/)[0].toLowerCase();
  return !NON_TERM_STARTERS.has(firstWord);
}

function extract(sentences, limit = 10) {
  const definitions = [];

  for (const s of sentences) {
    const text = s.text.trim();
    for (const pattern of DEFINITION_PATTERNS) {
      const match = text.match(pattern);
      if (!match) continue;

      const term = match[1].trim();
      const definition = match[2].trim();
      if (term.length > 1 && term.length < 50 && definition.length > 4 && isPlausibleTerm(term)) {
        definitions.push(`${term}: ${definition}`);
      }
      break;
    }
    if (definitions.length >= limit) break;
  }

  return definitions;
}

module.exports = { extract };
