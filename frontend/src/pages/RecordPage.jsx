import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import RecordButton from '../components/record/RecordButton';
import LiveTranscriptPanel from '../components/record/LiveTranscriptPanel';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ErrorBanner from '../components/common/ErrorBanner';
import { useSpeechRecognition, RECOGNITION_LANGUAGES } from '../hooks/useSpeechRecognition';
import { summarizeTranscript, createLecture } from '../api/lectures';

const CATEGORIES = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Engineering', 'Business', 'Arts', 'Languages', 'Other',
];

export default function RecordPage() {
  const navigate = useNavigate();
  const speech = useSpeechRecognition();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Other');
  const [manualTranscript, setManualTranscript] = useState('');
  const [editedTranscript, setEditedTranscript] = useState(null); // null until the user edits post-recording
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const transcript = speech.isSupported ? editedTranscript ?? speech.finalTranscript : manualTranscript;
  const hasTranscript = transcript.trim().length > 0;
  const showEditableTranscript = speech.isSupported ? !speech.isListening : true;

  function handleToggleRecording() {
    if (speech.isListening) {
      speech.stop();
    } else {
      setEditedTranscript(null);
      speech.reset();
      speech.start();
    }
  }

  async function handleGenerateNotes() {
    if (!title.trim() || !hasTranscript) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const notes = await summarizeTranscript(transcript.trim(), subject.trim() || 'General');
      const created = await createLecture({
        title: title.trim(),
        subject: subject.trim(),
        category,
        rawTranscript: transcript.trim(),
        transcript: transcript.trim(),
        summary: notes.summary,
        detailedNotes: notes.detailedNotes,
        keyPoints: notes.keyPoints,
        definitions: notes.definitions,
        examTopics: notes.examTopics,
        sentiment: notes.sentiment,
        entities: notes.entities,
        topics: notes.topics,
        readabilityScore: notes.readabilityScore,
        flashcards: notes.flashcards,
        entitySpans: notes.annotations?.entitySpans || [],
        keyTermSpans: notes.annotations?.keyTermSpans || [],
        enrichment: notes.enrichment,
      });
      navigate(`/lectures/${created.lecture._id}`);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Could not generate notes for this transcript.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell wide>
      <p className="label-mono mb-2">new lecture</p>
      <h1 className="font-display text-3xl font-semibold">Record a lecture</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-[280px,1fr]">
        <Card className="flex flex-col items-center gap-4 p-6">
          <RecordButton
            isListening={speech.isListening}
            onClick={handleToggleRecording}
            disabled={!speech.isSupported || submitting}
          />
          {!speech.isSupported && (
            <p className="text-center text-xs text-ink-muted">
              Your browser doesn't support live speech recognition. Paste or type the transcript instead.
            </p>
          )}
          {speech.error && <ErrorBanner message={`Microphone error: ${speech.error}`} />}

          {speech.isSupported && (
            <label className="flex w-full flex-col gap-1">
              <span className="label-mono">Lecture language</span>
              <select
                value={speech.lang}
                onChange={(e) => speech.changeLang(e.target.value)}
                disabled={speech.isListening}
                className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal disabled:opacity-50"
              >
                {RECOGNITION_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <span className="text-xs text-ink-faint">
                Recording keeps running through pauses — press Stop when the lecture ends.
              </span>
            </label>
          )}

          <div className="w-full border-t border-hairline pt-4">
            <label className="flex flex-col gap-1">
              <span className="label-mono">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
                placeholder="e.g. Newtonian Mechanics"
              />
            </label>
          </div>

          <label className="flex w-full flex-col gap-1">
            <span className="label-mono">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
              placeholder="e.g. Physics 101"
            />
          </label>

          <label className="flex w-full flex-col gap-1">
            <span className="label-mono">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-sm border border-hairline bg-paper px-3 py-2 text-sm outline-none focus:border-teal"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </Card>

        <div className="flex flex-col gap-4">
          <LiveTranscriptPanel
            finalText={speech.isSupported ? transcript : manualTranscript}
            interimText={speech.isSupported ? speech.interimTranscript : ''}
            editable={showEditableTranscript}
            onChange={speech.isSupported ? setEditedTranscript : setManualTranscript}
          />

          {submitError && <ErrorBanner message={submitError} />}

          <Button
            variant="amber"
            className="self-end px-6 py-3"
            disabled={!title.trim() || !hasTranscript || submitting || speech.isListening}
            onClick={handleGenerateNotes}
          >
            {submitting ? 'Running NLP pipeline…' : 'Generate notes'}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
