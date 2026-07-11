const { tokenize } = require('./tokenizer');
const posTagger = require('./posTagger');
const tfidf = require('./tfidf');
const summarizer = require('./summarizer');
const nerExtractor = require('./nerExtractor');
const keyTermExtractor = require('./keyTermExtractor');
const definitionExtractor = require('./definitionExtractor');
const sentimentAnalyzer = require('./sentimentAnalyzer');
const readability = require('./readability');
const flashcardGenerator = require('./flashcardGenerator');
const notesComposer = require('./notesComposer');

/**
 * Runs the full classical NLP pipeline over a raw transcript. Pure JS, no
 * network calls — always succeeds and is the guaranteed fallback when
 * Gemini enrichment is unavailable or fails.
 */
function runClassicalPipeline(transcript, subject = 'General') {
  const { doc, text, tokenOffsets, sentences, tokenIndexSpanToCharSpan } = tokenize(transcript);

  const { topTerms, sentenceScores } = tfidf.analyze(sentences);
  const { summary, selectedSentenceIndices } = summarizer.extract(sentences, sentenceScores);

  const entities = nerExtractor.extract({ doc, text, tokenOffsets, tokenIndexSpanToCharSpan });
  const keyPoints = keyTermExtractor.extractKeyPoints(sentences, sentenceScores, selectedSentenceIndices);
  const topics = keyTermExtractor.extractTopics(topTerms);
  const definitions = definitionExtractor.extract(sentences);
  const examTopics = keyTermExtractor.extractExamTopics(topTerms, definitions, entities);
  const sentiment = sentimentAnalyzer.analyze(sentences);
  const { readabilityScore, fleschReadingEase } = readability.score(text);
  const flashcards = flashcardGenerator.generate(definitions, keyPoints);

  const posSample = posTagger.sample(tokenOffsets, sentences);
  const keyTermSpans = resolveKeyTermSpans(topTerms, sentences);
  const detailedNotes = notesComposer.compose({ sentences, topTerms, summary, definitions, examTopics });

  return {
    summary,
    detailedNotes,
    keyPoints,
    definitions,
    examTopics,
    sentiment,
    entities: entities.map((e) => e.text),
    topics,
    readabilityScore,
    flashcards,
    subject,
    annotations: {
      entitySpans: entities,
      keyTermSpans,
      posSample,
      topTfidfTerms: topTerms,
      fleschReadingEase,
    },
  };
}

/**
 * Resolves character offsets for the top TF-IDF terms so the frontend can
 * highlight them inline, same as entity spans. Only the FIRST occurrence
 * per term is highlighted (documented limitation, consistent with the
 * entity-offset resolution approach in nerExtractor.js).
 */
function resolveKeyTermSpans(topTerms, sentences, limit = 15) {
  const spans = [];

  for (const { term, score } of topTerms.slice(0, limit)) {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    for (const sentence of sentences) {
      const match = sentence.text.match(regex);
      if (match && typeof match.index === 'number') {
        const start = sentence.start + match.index;
        spans.push({ text: match[0], score, start, end: start + match[0].length });
        break;
      }
    }
  }

  return spans.sort((a, b) => a.start - b.start);
}

module.exports = { runClassicalPipeline };
