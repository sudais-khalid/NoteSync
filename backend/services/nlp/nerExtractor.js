const compromise = require('compromise');
const { its } = require('./tokenizer');

const WINK_TYPE_LABELS = {
  PERSON: 'PERSON',
  ORG: 'ORG',
  GPE: 'PLACE',
  LOC: 'PLACE',
  DATE: 'DATE',
  TIME: 'TIME',
  MONEY: 'MONEY',
  CARDINAL: 'NUMBER',
  ORDINAL: 'NUMBER',
  QUANTITY: 'QUANTITY',
  PERCENT: 'PERCENT',
};

function cleanTerm(term) {
  return term.replace(/[.,;:!?]+$/, '').trim();
}

/**
 * Combines wink-nlp's statistical NER (standard entity types: people, places,
 * orgs, dates, quantities...) with a compromise pass for domain noun phrases
 * wink's generic model tends to miss (e.g. "the Krebs cycle", "Big-O notation").
 * Offsets are resolved against the RAW transcript string so the frontend can
 * render inline highlights without re-tokenizing.
 */
function extract({ doc, text, tokenOffsets, tokenIndexSpanToCharSpan }) {
  const entities = [];
  const seen = new Set();

  doc.entities().each((e) => {
    const span = e.out(its.span);
    const { start, end } = tokenIndexSpanToCharSpan(tokenOffsets, span);
    const value = text.slice(start, end);
    const type = WINK_TYPE_LABELS[e.out(its.type)] || e.out(its.type) || 'OTHER';
    const key = value.toLowerCase();
    if (!value || seen.has(key)) return;
    seen.add(key);
    entities.push({ text: value, type, start, end });
  });

  const cDoc = compromise(text);
  const supplemental = [
    ...cDoc.people().out('array').map((t) => ({ text: t, type: 'PERSON' })),
    ...cDoc.organizations().out('array').map((t) => ({ text: t, type: 'ORG' })),
    ...cDoc.places().out('array').map((t) => ({ text: t, type: 'PLACE' })),
  ];

  supplemental.forEach(({ text: raw, type }) => {
    const term = cleanTerm(raw);
    const key = term.toLowerCase();
    if (term.length < 2 || seen.has(key)) return;
    // Ambiguity note: indexOf resolves the FIRST occurrence only. Repeated
    // terms elsewhere in the transcript won't all get highlighted — acceptable
    // for a showcase annotation layer, not exhaustive markup.
    const idx = text.indexOf(term);
    if (idx === -1) return;
    seen.add(key);
    entities.push({ text: term, type, start: idx, end: idx + term.length });
  });

  return entities.sort((a, b) => a.start - b.start);
}

module.exports = { extract };
