/**
 * Hand-implemented Flesch-Kincaid readability formulas (no external dep —
 * the previously used text-readability package is ESM-only and breaks under
 * Jest's CJS runtime; the formulas themselves are simple and implementing
 * them directly is truer to the NLP-course spirit anyway).
 *
 * Syllables are estimated with the standard vowel-cluster heuristic:
 * count groups of consecutive vowels, subtract silent trailing "e",
 * minimum one syllable per word. Imperfect on edge cases (as all
 * dictionary-free syllable counters are) but consistent and adequate
 * for grade-level estimation.
 */
function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;

  const stripped = w.replace(/(?:[^laeiouy]e|ed|es)$/, '');
  const clusters = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, clusters ? clusters.length : 1);
}

function textStats(text) {
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const words = text.split(/\s+/).map((w) => w.replace(/[^a-zA-Z'-]/g, '')).filter(Boolean);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return { sentenceCount: Math.max(1, sentences.length), wordCount: words.length, syllableCount: syllables };
}

function score(text) {
  if (!text || text.trim().length === 0) {
    return { readabilityScore: null, fleschReadingEase: null };
  }

  const { sentenceCount, wordCount, syllableCount } = textStats(text);
  if (wordCount === 0) {
    return { readabilityScore: null, fleschReadingEase: null };
  }

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  const fkGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const fres = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

  return {
    readabilityScore: Math.round(fkGrade * 10) / 10,
    fleschReadingEase: Math.round(fres * 10) / 10,
  };
}

module.exports = { score, countSyllables };
