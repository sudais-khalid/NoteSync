import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognitionAPI =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * Recognition languages offered to the user. The Web Speech API cannot
 * listen in two languages at once, so code-mixed Urdu-English lectures get
 * a dedicated "mixed" option using en-IN — in practice the most tolerant
 * recognizer for South Asian accented English with embedded Urdu/Hindi
 * words (it transliterates Urdu words to Roman script rather than dropping
 * them, which the NLP pipeline's Roman-Urdu stopword list then handles).
 */
export const RECOGNITION_LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'ur-PK', label: 'اردو (Urdu)' },
  { code: 'en-IN', label: 'Mixed English + Urdu' },
];

/**
 * Wrapper around the browser's Web Speech API. Transcription stays entirely
 * client-side/free — the backend never sees audio, only the finished text.
 *
 * Key reliability behavior: browsers silently END recognition after a few
 * seconds of silence or ~60s of audio. Without handling that, a lecture
 * recording quietly stops in the first minute. While the user hasn't
 * pressed stop, onend triggers an automatic restart, so capture continues
 * through pauses for arbitrarily long lectures.
 */
export function useSpeechRecognition() {
  const isSupported = !!SpeechRecognitionAPI;

  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState('en-US');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const keepAliveRef = useRef(false); // true while the user wants recording on
  const restartTimerRef = useRef(null);

  useEffect(() => {
    if (!isSupported) return undefined;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += `${piece} `;
        } else {
          interim += piece;
        }
      }
      if (finalChunk) setFinalTranscript((prev) => prev + finalChunk);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      // "no-speech" fires during natural pauses and "aborted" during our own
      // restarts — neither is a real error. Permission problems are final.
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        keepAliveRef.current = false;
        setError('Microphone access was denied. Allow the mic permission and try again.');
        setIsListening(false);
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(event.error);
      }
    };

    recognition.onend = () => {
      setInterimTranscript('');
      if (keepAliveRef.current) {
        // Browser ended recognition on silence/timeout — restart after a
        // short beat so long lectures keep recording through pauses.
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            /* already restarted */
          }
        }, 250);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      keepAliveRef.current = false;
      clearTimeout(restartTimerRef.current);
      recognition.onend = null;
      recognition.stop();
    };
  }, [isSupported, lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError('');
    keepAliveRef.current = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      // start() throws if already running — ignore, state stays consistent.
    }
  }, []);

  const stop = useCallback(() => {
    keepAliveRef.current = false;
    clearTimeout(restartTimerRef.current);
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    setError('');
  }, []);

  const changeLang = useCallback((code) => {
    // Changing language recreates the recognizer (effect above re-runs);
    // only allowed while not recording so no audio is lost mid-session.
    setLang(code);
  }, []);

  return {
    isSupported,
    isListening,
    lang,
    changeLang,
    finalTranscript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  };
}
