const { hasUrdu } = require('./urduSupport');

/**
 * Composes detailed, readable study notes from the classical pipeline's
 * artifacts. Instead of only terse bullet points, the transcript's sentences
 * are grouped into topic sections (using the top TF-IDF terms as section
 * seeds) so a student can read the notes as connected prose, section by
 * section, and still get the full substance of the lecture.
 *
 * Returns [{ heading, body }] — stored on the Lecture as `detailedNotes`.
 */
function titleCase(term) {
  if (hasUrdu(term)) return term; // no casing in Urdu script
  return term.charAt(0).toUpperCase() + term.slice(1);
}

const EXAM_CUE_RE = /\b(exam|test|quiz|assessment|imtihan|paper)\b|امتحان|ٹیسٹ|پرچہ/i;

function compose({ sentences, topTerms, summary, definitions, examTopics }) {
  const notes = [];
  const usedSentences = new Set();

  if (summary && summary.trim()) {
    notes.push({ heading: 'Overview', body: summary.trim() });
  }

  // Topic sections: each of the top terms seeds a section containing every
  // sentence that mentions it (original order, no sentence reused across
  // sections so the notes read as a progression, not repetition).
  const sectionSeeds = topTerms.slice(0, 6);
  for (const { term } of sectionSeeds) {
    const needle = term.toLowerCase();
    const matching = sentences.filter(
      (s) => !usedSentences.has(s.index) && s.text.toLowerCase().includes(needle)
    );
    if (matching.length < 2) continue; // one stray mention isn't a section

    matching.forEach((s) => usedSentences.add(s.index));
    notes.push({
      heading: titleCase(term),
      body: matching.map((s) => s.text.trim()).join(' '),
    });
  }

  // Remaining substantial sentences that no topic section captured — keep
  // them so the notes never silently drop lecture content.
  const leftovers = sentences.filter((s) => !usedSentences.has(s.index) && s.text.trim().split(/\s+/).length >= 6);
  if (leftovers.length >= 2) {
    notes.push({
      heading: 'Additional points',
      body: leftovers.map((s) => s.text.trim()).join(' '),
    });
  }

  if (definitions.length > 0) {
    notes.push({ heading: 'Key terms & definitions', body: definitions.join('\n') });
  }

  const examSentences = sentences.filter((s) => EXAM_CUE_RE.test(s.text));
  if (examTopics.length > 0 || examSentences.length > 0) {
    const parts = [];
    if (examTopics.length > 0) parts.push(`Focus topics: ${examTopics.join(', ')}.`);
    if (examSentences.length > 0) parts.push(examSentences.map((s) => s.text.trim()).join(' '));
    notes.push({ heading: 'Exam preparation', body: parts.join('\n') });
  }

  return notes;
}

module.exports = { compose };
