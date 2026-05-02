const axios = require('axios');

const summarizationService = {
  /**
   * Summarize lecture transcript using Google Gemini API with full NLP analysis
   * @param {string} transcript - The lecture transcript
   * @param {string} subject - The subject/topic of the lecture
   * @returns {object} - Summarized content with NLP-enriched fields
   */
  async summarizeLecture(transcript, subject = 'General') {
    try {
      console.log('\nStarting NLP summarization with Gemini 2.0 Flash...');

      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript is empty');
      }

      const apiKey = process.env.GEMINI_API_KEY;
      console.log('API Key exists:', !!apiKey);

      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key not properly configured');
      }

      console.log('Transcript length:', transcript.length, 'characters');

      // Expanded NLP-enriched prompt
      const prompt = `You are an expert educational NLP assistant. Analyze the following lecture transcript and return a comprehensive, structured study guide using advanced natural language processing.

**Subject:** ${subject}

**Transcript:**
${transcript}

**Your Tasks:**

1. **Summary** — Write a clear 2-3 paragraph summary of the main educational content. Remove casual conversation, jokes, and off-topic content.

2. **Key Points** — Extract 5-10 most important points for understanding the topic.

3. **Definitions** — List important terms and their definitions mentioned in the lecture.

4. **Exam Topics** — Identify topics most likely to appear in exams.

5. **Sentiment Analysis** — Determine the overall tone/sentiment of the lecture content:
   - "positive": motivating, encouraging, affirming content
   - "neutral": factual, objective, balanced content
   - "critical": analytical, questioning, problem-focused content
   - "mixed": combination of tones

6. **Named Entity Recognition (NER)** — Extract important named entities: people (scientists, theorists, researchers), places (labs, institutions), theories (named theories/laws), formulas/equations, and key technical terms.

7. **Topic Clusters** — Identify 3-5 main topic groups/themes in the lecture. Each should be a short descriptive phrase.

8. **Readability Score** — Estimate the Flesch-Kincaid Grade Level (a number like 8.5, 12.0, etc.) based on vocabulary complexity and sentence structure in the transcript.

9. **Flashcards** — Generate 5-8 question-answer pairs for self-testing. Each flashcard should test understanding of a key concept.

**Return ONLY a valid JSON object with this exact structure:**
{
  "summary": "2-3 paragraph summary of the lecture...",
  "keyPoints": ["point 1", "point 2", "..."],
  "definitions": ["Term: definition 1", "Term: definition 2", "..."],
  "examTopics": ["topic 1", "topic 2", "..."],
  "sentiment": "neutral",
  "entities": ["Entity 1", "Entity 2", "..."],
  "topics": ["Topic cluster 1", "Topic cluster 2", "..."],
  "readabilityScore": 10.5,
  "flashcards": [
    { "question": "What is...?", "answer": "It is..." },
    { "question": "Explain...?", "answer": "..." }
  ]
}

**CRITICAL:** Return ONLY the JSON object. No markdown, no backticks, no extra text.`;

      console.log('Sending NLP request to Gemini API...');

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4000
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 90000 // 90 second timeout for longer NLP output
        }
      );

      console.log('Gemini NLP Response received');

      // Extract text from Gemini response format
      const text = response.data.candidates[0].content.parts[0].text;
      console.log('Response text preview:', text.substring(0, 120) + '...');

      // Parse the JSON response
      let parsedResponse;
      try {
        // Strip any markdown code fences if present
        const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = {
            summary: text,
            keyPoints: [],
            definitions: [],
            examTopics: [],
            sentiment: 'neutral',
            entities: [],
            topics: [],
            readabilityScore: null,
            flashcards: []
          };
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        parsedResponse = {
          summary: text.replace(/```json\n?|\n?```/g, '').trim(),
          keyPoints: [],
          definitions: [],
          examTopics: [],
          sentiment: 'neutral',
          entities: [],
          topics: [],
          readabilityScore: null,
          flashcards: []
        };
      }

      // Validate sentiment value
      const validSentiments = ['positive', 'neutral', 'critical', 'mixed'];
      const sentimentValue = validSentiments.includes(parsedResponse.sentiment)
        ? parsedResponse.sentiment
        : 'neutral';

      // Ensure all fields exist and are correct types
      const finalResponse = {
        summary: parsedResponse.summary || 'Summary not available',
        keyPoints: Array.isArray(parsedResponse.keyPoints) ? parsedResponse.keyPoints : [],
        definitions: Array.isArray(parsedResponse.definitions) ? parsedResponse.definitions : [],
        examTopics: Array.isArray(parsedResponse.examTopics) ? parsedResponse.examTopics : [],
        sentiment: sentimentValue,
        entities: Array.isArray(parsedResponse.entities) ? parsedResponse.entities : [],
        topics: Array.isArray(parsedResponse.topics) ? parsedResponse.topics : [],
        readabilityScore: typeof parsedResponse.readabilityScore === 'number'
          ? parsedResponse.readabilityScore
          : null,
        flashcards: Array.isArray(parsedResponse.flashcards)
          ? parsedResponse.flashcards.filter(f => f.question && f.answer)
          : []
      };

      console.log('NLP Summarization completed successfully');
      console.log(`  Sentiment: ${finalResponse.sentiment}`);
      console.log(`  Entities: ${finalResponse.entities.length}`);
      console.log(`  Topics: ${finalResponse.topics.length}`);
      console.log(`  Flashcards: ${finalResponse.flashcards.length}`);
      console.log(`  Readability Score: ${finalResponse.readabilityScore}`);

      return finalResponse;

    } catch (error) {
      console.error('Summarization Error:', error.message);

      if (error.response) {
        console.error('API Response Error:');
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));

        const errorMsg = error.response.data?.error?.message ||
                        error.response.statusText ||
                        'API request failed';
        throw new Error(`Gemini API Error (${error.response.status}): ${errorMsg}`);
      } else if (error.request) {
        console.error('No Response from API');
        throw new Error('No response from Gemini API. Check your internet connection.');
      } else {
        throw new Error(`Failed to summarize: ${error.message}`);
      }
    }
  },

  /**
   * Validate API key
   * @returns {boolean} - True if API key is configured
   */
  isConfigured() {
    const apiKey = process.env.GEMINI_API_KEY;
    const isValid = !!apiKey &&
                    apiKey !== 'your_gemini_api_key_here' &&
                    apiKey.length > 0 &&
                    apiKey.startsWith('AIza');

    console.log('Gemini API Key Check:');
    console.log('  - Exists:', !!apiKey);
    console.log('  - Length:', apiKey ? apiKey.length : 0);
    console.log('  - Starts with AIza:', apiKey ? apiKey.startsWith('AIza') : false);
    console.log('  - Valid:', isValid);

    return isValid;
  }
};

module.exports = summarizationService;