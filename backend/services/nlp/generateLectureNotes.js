const { runClassicalPipeline } = require('./pipeline');
const geminiEnrichment = require('./geminiEnrichment');

/**
 * Merges Gemini's enrichment into the classical result field-by-field, so a
 * partial or malformed enrichment response (e.g. good summary, empty
 * flashcards array) doesn't discard the classical fallback for other fields.
 */
function mergeFieldByField(classical, enriched) {
  const merged = { ...classical };
  if (enriched.summary) merged.summary = enriched.summary;
  if (enriched.detailedNotes && enriched.detailedNotes.length) merged.detailedNotes = enriched.detailedNotes;
  if (enriched.definitions && enriched.definitions.length) merged.definitions = enriched.definitions;
  if (enriched.examTopics && enriched.examTopics.length) merged.examTopics = enriched.examTopics;
  if (enriched.flashcards && enriched.flashcards.length) merged.flashcards = enriched.flashcards;
  return merged;
}

/**
 * The classical pipeline always runs first and is a complete, valid result
 * on its own (pure JS, no network calls, can't fail). Gemini enrichment is
 * strictly best-effort on top of it — if it's not configured, times out, or
 * errors, the classical output is returned unchanged rather than failing
 * the request.
 */
async function generateLectureNotes(transcript, subject = 'General') {
  const classical = runClassicalPipeline(transcript, subject);

  if (!geminiEnrichment.isConfigured()) {
    return { ...classical, enrichment: 'none' };
  }

  try {
    const enriched = await geminiEnrichment.enrich(transcript, subject, classical);
    return { ...mergeFieldByField(classical, enriched), enrichment: 'gemini' };
  } catch (err) {
    console.error('Gemini enrichment failed, falling back to classical output:', err.message);
    return { ...classical, enrichment: 'none', enrichmentError: err.message };
  }
}

module.exports = { generateLectureNotes };
