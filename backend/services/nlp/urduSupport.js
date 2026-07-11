/**
 * Lightweight Urdu / code-mixed (English-Urdu) support for the NLP pipeline.
 * There is no mature Urdu NLP library for Node (urduhack/LughaatNLP are
 * Python-only), so the essentials are embedded here: script detection,
 * a stopword list, and sentence-mark normalization that PRESERVES character
 * offsets (same-length replacement) so transcript highlighting never desyncs.
 */

// Arabic script block covers Urdu letters; U+0600–U+06FF + Arabic
// presentation forms commonly produced by keyboards/ASR.
const URDU_CHAR_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

function isUrduToken(token) {
  return URDU_CHAR_RE.test(token);
}

function hasUrdu(text) {
  return URDU_CHAR_RE.test(text || '');
}

/**
 * Common Urdu stopwords (function words, pronouns, auxiliaries) plus
 * frequent Roman-Urdu fillers that show up in code-mixed lecture speech.
 * Deliberately compact — enough to keep TF-IDF rankings meaningful.
 */
const URDU_STOPWORDS = new Set([
  // Urdu script
  'کا', 'کی', 'کے', 'کو', 'میں', 'سے', 'پر', 'اور', 'یا', 'ہے', 'ہیں', 'تھا',
  'تھی', 'تھے', 'ہو', 'ہوں', 'گا', 'گی', 'گے', 'نے', 'یہ', 'وہ', 'اس', 'ان',
  'جو', 'کہ', 'بھی', 'تو', 'ہی', 'نہیں', 'ایک', 'اب', 'پھر', 'اگر', 'لیکن',
  'مگر', 'کیا', 'کیوں', 'کب', 'کہاں', 'کیسے', 'ہم', 'تم', 'آپ', 'اپنا', 'اپنی',
  'اپنے', 'کچھ', 'سب', 'بہت', 'جب', 'تک', 'ساتھ', 'بعد', 'پہلے', 'یہاں', 'وہاں',
  'کرنا', 'کرتے', 'کرتا', 'کرتی', 'ہوتا', 'ہوتی', 'ہوتے', 'رہا', 'رہی', 'رہے',
  'دیا', 'لیا', 'گیا', 'گئی', 'گئے', 'والا', 'والی', 'والے', 'چاہیے', 'سکتا',
  'سکتی', 'سکتے', 'ہوگا', 'ہوگی', 'کوئی', 'ہر',
  // Roman Urdu fillers common in code-mixed lectures
  'hai', 'hain', 'tha', 'thi', 'the', 'ka', 'ki', 'ke', 'ko', 'mein', 'se',
  'par', 'aur', 'ya', 'ye', 'yeh', 'woh', 'wo', 'is', 'us', 'jo', 'bhi', 'to',
  'nahi', 'nahin', 'ek', 'ab', 'phir', 'agar', 'lekin', 'magar', 'kya', 'kyun',
  'kab', 'kahan', 'kaise', 'hum', 'tum', 'aap', 'apna', 'apni', 'apne', 'kuch',
  'sab', 'bohat', 'bahut', 'jab', 'tak', 'sath', 'saath', 'baad', 'pehle',
  'karna', 'karte', 'karta', 'karti', 'hota', 'hoti', 'hote', 'raha', 'rahi',
  'rahe', 'diya', 'liya', 'gaya', 'gayi', 'gaye', 'wala', 'wali', 'wale', 'ne',
]);

function isUrduStopword(token) {
  return URDU_STOPWORDS.has(token.toLowerCase());
}

/**
 * Returns a SAME-LENGTH copy of the text with Urdu sentence punctuation
 * mapped to Latin equivalents, so English-trained sentence segmenters see
 * the boundaries. Because every replacement is 1-char-for-1-char, spans
 * computed on the normalized copy slice correctly from the ORIGINAL text.
 *   ۔ (U+06D4 full stop)      -> .
 *   ؟ (U+061F question mark)  -> ?
 *   ، (U+060C comma)          -> ,
 *   ؛ (U+061B semicolon)      -> ;
 */
function normalizeSentenceMarks(text) {
  return (text || '')
    .replace(/۔/g, '.')
    .replace(/؟/g, '?')
    .replace(/،/g, ',')
    .replace(/؛/g, ';');
}

module.exports = { isUrduToken, hasUrdu, isUrduStopword, normalizeSentenceMarks, URDU_STOPWORDS };
