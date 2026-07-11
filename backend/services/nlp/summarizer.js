/**
 * Extractive summarization: rank sentences by TF-IDF salience, take the
 * top-K, then re-order by original position so the summary reads as
 * coherent prose instead of a shuffled highlight reel.
 */
function extract(sentences, sentenceScores) {
  const n = sentences.length;
  if (n === 0) return { summary: '', selectedSentenceIndices: [] };

  const k = Math.min(n, Math.max(Math.min(3, n), Math.round(n * 0.15)), 12);
  const ranked = [...sentenceScores].sort((a, b) => b.score - a.score).slice(0, k);
  const selectedSentenceIndices = ranked.map((r) => r.sentenceIndex).sort((a, b) => a - b);
  const summary = selectedSentenceIndices.map((i) => sentences[i].text.trim()).join(' ');

  return { summary, selectedSentenceIndices };
}

module.exports = { extract };
