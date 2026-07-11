const winkSentiment = require('wink-sentiment');

/**
 * Lexicon-based (AFINN, via wink-sentiment which also handles negations and
 * emoticons) sentiment scoring. NOTE: the app's existing taxonomy
 * (positive / neutral / critical / mixed) does NOT match standard lexicon
 * output (positive / neutral / negative). "critical" in this app's original
 * meaning is "analytical, questioning, problem-focused" — a lexicon can't
 * detect that register. As a pragmatic approximation, lexicon-negative is
 * mapped to "critical". "mixed" fires when both strongly positive and
 * strongly negative sentences appear in the same transcript.
 */
function analyze(sentences) {
  if (sentences.length === 0) return 'neutral';

  const perSentence = sentences.map((s) => winkSentiment(s.text).normalizedScore);
  const overall = perSentence.reduce((sum, v) => sum + v, 0) / perSentence.length;

  const hasStrongPositive = perSentence.some((v) => v > 0.5);
  const hasStrongNegative = perSentence.some((v) => v < -0.5);

  if (hasStrongPositive && hasStrongNegative) return 'mixed';
  if (overall > 0.15) return 'positive';
  if (overall < -0.15) return 'critical';
  return 'neutral';
}

module.exports = { analyze };
