require('dotenv').config();
const { generateLectureNotes } = require('../services/nlp/generateLectureNotes');

const transcript = `
Today we are going to talk about Newtonian mechanics. Isaac Newton was an English physicist and mathematician who lived in the seventeenth century. He is best known for formulating the laws of motion and the law of universal gravitation.

Newton's second law states that force equals mass times acceleration. This is one of the most important equations in classical physics.

Gravity is the force that attracts two bodies toward each other. Newton discovered that this force follows an inverse square law.

Momentum is defined as the product of an object's mass and velocity. Conservation of momentum is a fundamental principle that applies in collisions.

This topic is important for the upcoming exam.
`.trim();

async function main() {
  console.log('--- WITH Gemini configured ---');
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  const withGemini = await generateLectureNotes(transcript, 'Physics');
  console.log('enrichment:', withGemini.enrichment);
  console.log('enrichmentError:', withGemini.enrichmentError);
  console.log('summary:', withGemini.summary);
  console.log('definitions:', withGemini.definitions);
  console.log('examTopics:', withGemini.examTopics);
  console.log('flashcards count:', withGemini.flashcards.length);
  console.log('entities (must stay classical):', withGemini.entities);
  console.log('sentiment (must stay classical):', withGemini.sentiment);
  console.log('readabilityScore (must stay classical):', withGemini.readabilityScore);
  console.log('annotations present:', !!withGemini.annotations, Object.keys(withGemini.annotations || {}));

  console.log('\n--- WITHOUT Gemini configured ---');
  const savedKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const withoutGemini = await generateLectureNotes(transcript, 'Physics');
  console.log('enrichment:', withoutGemini.enrichment);
  console.log('summary:', withoutGemini.summary.slice(0, 120) + '...');
  console.log('success (always returns valid object):', typeof withoutGemini.summary === 'string' && withoutGemini.summary.length > 0);
  process.env.GEMINI_API_KEY = savedKey;
}

main().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
