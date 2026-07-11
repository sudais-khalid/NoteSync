const winkNLP = require('wink-nlp');
const model = require('wink-eng-lite-web-model');
const { normalizeSentenceMarks } = require('./urduSupport');

const nlp = winkNLP(model);
const its = nlp.its;

/**
 * wink-nlp's its.span returns TOKEN-INDEX ranges, not character offsets.
 * Character offsets are reconstructed by walking the token stream and
 * accumulating each token's precedingSpaces + value length, since wink
 * preserves the original whitespace verbatim in precedingSpaces.
 */
function buildTokenOffsets(doc) {
  const offsets = [];
  let cursor = 0;
  doc.tokens().each((t) => {
    const preceding = t.out(its.precedingSpaces) || '';
    const value = t.out(its.value) || '';
    const start = cursor + preceding.length;
    const end = start + value.length;
    offsets.push({ text: value, pos: t.out(its.pos), start, end });
    cursor = end;
  });
  return offsets;
}

function tokenIndexSpanToCharSpan(tokenOffsets, [startIdx, endIdx]) {
  const start = tokenOffsets[startIdx] ? tokenOffsets[startIdx].start : 0;
  const end = tokenOffsets[endIdx] ? tokenOffsets[endIdx].end : start;
  return { start, end };
}

function tokenize(rawText) {
  const text = rawText || '';
  // Segmentation runs on a SAME-LENGTH copy with Urdu sentence marks (۔ ؟ ، ؛)
  // mapped to Latin ones so wink's English-trained sentence detector finds the
  // boundaries. All spans are sliced from the ORIGINAL text — the 1:1 length
  // guarantee keeps every offset valid against what gets persisted.
  const normalized = normalizeSentenceMarks(text);
  const doc = nlp.readDoc(normalized);
  const tokenOffsets = buildTokenOffsets(doc);

  const sentences = doc.sentences().out(its.span).map((span, index) => {
    const { start, end } = tokenIndexSpanToCharSpan(tokenOffsets, span);
    return { index, text: text.slice(start, end), start, end };
  });

  return { doc, text, tokenOffsets, sentences, tokenIndexSpanToCharSpan };
}

module.exports = { tokenize, nlp, its };
