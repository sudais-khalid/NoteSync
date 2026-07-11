const { runClassicalPipeline } = require('../services/nlp/pipeline');

const cleanTranscript = `
Today we are going to talk about Newtonian mechanics. Isaac Newton was an English physicist and mathematician who lived in the seventeenth century. He is best known for formulating the laws of motion and the law of universal gravitation.

Newton's second law states that force equals mass times acceleration. This is one of the most important equations in classical physics. It means that the acceleration of an object depends directly on the net force acting on it and inversely on its mass.

Gravity is the force that attracts two bodies toward each other. Newton discovered that this force follows an inverse square law, meaning it weakens rapidly as the distance between objects increases.

Momentum is defined as the product of an object's mass and velocity. Conservation of momentum is a fundamental principle that applies in collisions and explosions.

This topic is important for the upcoming exam. You should understand the relationship between force, mass, and acceleration, and be able to apply Newton's laws to solve numerical problems.
`.trim();

const messyTranscript = `
okay so um today we're gonna talk about like newtons laws right so basically force equals mass times acceleration thats the big one um isaac newton he was this english guy super smart lived like way back in the day and uh he came up with gravity too like the whole apple falling thing um so gravity is basically the force that pulls stuff together and it gets weaker the further away things are um momentum is mass times velocity dont forget that one its gonna be on the test um yeah i think thats pretty much it for today lets take a break
`.trim();

function report(label, transcript) {
  console.log(`\n===== ${label} =====`);
  const result = runClassicalPipeline(transcript, 'Physics');

  console.log('summary:', result.summary);
  console.log('keyPoints:', result.keyPoints);
  console.log('definitions:', result.definitions);
  console.log('examTopics:', result.examTopics);
  console.log('sentiment:', result.sentiment);
  console.log('entities:', result.entities);
  console.log('topics:', result.topics);
  console.log('readabilityScore:', result.readabilityScore);
  console.log('flashcards:', result.flashcards);
  console.log('entitySpans (verify offsets):');
  result.annotations.entitySpans.forEach((e) => {
    const slice = transcript.slice(e.start, e.end);
    const ok = slice === e.text;
    console.log(`  [${e.start},${e.end}) type=${e.type} text="${e.text}" sliceMatches=${ok}${ok ? '' : ` (got "${slice}")`}`);
  });
  console.log('keyTermSpans (verify offsets):');
  result.annotations.keyTermSpans.slice(0, 8).forEach((k) => {
    const slice = transcript.slice(k.start, k.end);
    const ok = slice.toLowerCase() === k.text.toLowerCase();
    console.log(`  [${k.start},${k.end}) text="${k.text}" sliceMatches=${ok}${ok ? '' : ` (got "${slice}")`}`);
  });
  console.log('posSample length:', result.annotations.posSample.length);
  console.log('topTfidfTerms (top 5):', result.annotations.topTfidfTerms.slice(0, 5));
}

report('CLEAN TRANSCRIPT', cleanTranscript);
report('MESSY ASR-STYLE TRANSCRIPT', messyTranscript);
