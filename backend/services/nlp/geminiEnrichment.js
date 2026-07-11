const axios = require('axios');

const ENRICHMENT_TIMEOUT_MS = 8000; // kept well under Vercel's default 10s function timeout

/**
 * Optional secondary pass over the classical NLP pipeline's output. Unlike
 * the old summarizationService (which generated everything from scratch),
 * this only asks Gemini to polish the three fields classical extraction is
 * weakest at: definitions (low regex recall), flashcards (mechanical
 * phrasing), and examTopics (no real classical equivalent) — plus a light
 * prose pass on the summary. It must NOT touch entities/sentiment/topics/
 * readabilityScore: those are the fields that demonstrate the actual NLP
 * technique and should stay classical-only regardless of enrichment.
 */
function isConfigured() {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 0 && apiKey.startsWith('AIza');
}

function buildPrompt(transcript, subject, classical) {
  return `You are an educational NLP assistant. A classical NLP pipeline (tokenization, TF-IDF extractive summarization, statistical NER, rule-based definition extraction) already analyzed this lecture transcript and produced a first-pass result below. Your job is ONLY to polish and improve four fields — do not invent a different analysis.

**Subject:** ${subject}

**Transcript:**
${transcript}

**Classical pipeline's first-pass output (for context):**
${JSON.stringify({
  summary: classical.summary,
  detailedNotes: classical.detailedNotes,
  definitions: classical.definitions,
  examTopics: classical.examTopics,
  flashcards: classical.flashcards,
}, null, 2)}

**Your tasks:**
1. **summary** — Rewrite into clearer, more natural 2-3 paragraph prose covering the same content.
2. **detailedNotes** — Rewrite each section's body into fluent, detailed, student-readable study prose (keep the same headings and coverage; expand explanations where the transcript supports it; if the lecture mixes Urdu and English, keep key Urdu phrasing where it aids understanding).
3. **definitions** — Improve recall and phrasing. Find important terms the classical pass missed and phrase each as "Term: definition".
4. **examTopics** — Suggest the topics most likely to appear in an exam, as short phrases.
5. **flashcards** — Generate 5-8 naturally-phrased question/answer study pairs.

Do NOT return entities, sentiment, topics, or readabilityScore — those are intentionally left to the classical pipeline.

**Return ONLY a valid JSON object with this exact structure:**
{
  "summary": "...",
  "detailedNotes": [{ "heading": "...", "body": "..." }],
  "definitions": ["Term: definition", "..."],
  "examTopics": ["topic 1", "..."],
  "flashcards": [{ "question": "...", "answer": "..." }]
}

**CRITICAL:** Return ONLY the JSON object. No markdown, no backticks, no extra text.`;
}

function parseResponse(text) {
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    return null;
  }
}

async function enrich(transcript, subject, classical) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = buildPrompt(transcript, subject, classical);

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 4000 }, // detailedNotes rewriting needs headroom
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: ENRICHMENT_TIMEOUT_MS,
    }
  );

  const text = response.data.candidates[0].content.parts[0].text;
  const parsed = parseResponse(text);
  if (!parsed) throw new Error('Gemini enrichment returned no parseable JSON');

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : undefined,
    detailedNotes: Array.isArray(parsed.detailedNotes)
      ? parsed.detailedNotes.filter((n) => n && n.heading && n.body)
      : undefined,
    definitions: Array.isArray(parsed.definitions) ? parsed.definitions : undefined,
    examTopics: Array.isArray(parsed.examTopics) ? parsed.examTopics : undefined,
    flashcards: Array.isArray(parsed.flashcards)
      ? parsed.flashcards.filter((f) => f.question && f.answer)
      : undefined,
  };
}

module.exports = { isConfigured, enrich };
