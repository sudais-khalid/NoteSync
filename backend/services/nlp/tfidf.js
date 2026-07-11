// Deep requires on purpose: natural's index.js unconditionally loads its
// sentiment module, which pulls the ESM-only afinn-165 package and breaks
// under Jest's CJS runtime. We only need TfIdf and the stopword list.
const { TfIdf } = require('natural/lib/natural/tfidf');
const { words: stopwords } = require('natural/lib/natural/util/stopwords');
const { isUrduStopword } = require('./urduSupport');

const ENGLISH_STOPWORDS = new Set(stopwords.map((w) => w.toLowerCase()));

/**
 * Bilingual tokenization for TF-IDF. natural's built-in tokenizer silently
 * drops non-Latin text, so Urdu words never scored; passing pre-tokenized
 * arrays (which TfIdf.addDocument supports) keeps Urdu terms in the corpus.
 * Latin words and Urdu-script runs are both captured.
 */
function tfidfTokens(text) {
  const matches = text.toLowerCase().match(/[a-z0-9'’-]+|[؀-ۿ]+/g) || [];
  return matches.filter(
    (t) => t.length >= 2 && !/^\d+$/.test(t) && !ENGLISH_STOPWORDS.has(t) && !isUrduStopword(t)
  );
}

/**
 * Treats each sentence as one "document" in the TF-IDF corpus so scores
 * reflect intra-lecture salience (a term's importance within THIS transcript),
 * which is what extractive summarization and key-term ranking need.
 */
function analyze(sentences) {
  const tfidf = new TfIdf();
  sentences.forEach((s) => tfidf.addDocument(tfidfTokens(s.text)));

  const sentenceScores = sentences.map((s, i) => {
    const terms = tfidf.listTerms(i);
    const score = terms.reduce((sum, t) => sum + t.tfidf, 0);
    return { sentenceIndex: i, score };
  });

  const termTotals = new Map();
  sentences.forEach((s, i) => {
    tfidf.listTerms(i).forEach(({ term, tfidf: score }) => {
      if (term.length < 2) return;
      termTotals.set(term, (termTotals.get(term) || 0) + score);
    });
  });

  const topTerms = [...termTotals.entries()]
    .map(([term, score]) => ({ term, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return { topTerms, sentenceScores };
}

module.exports = { analyze, tfidfTokens };
