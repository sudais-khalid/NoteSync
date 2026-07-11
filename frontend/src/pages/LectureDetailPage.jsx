import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import Card from '../components/common/Card';
import AnnotatedTranscript from '../components/manuscript/AnnotatedTranscript';
import MarginNote from '../components/manuscript/MarginNote';
import EntityLegend from '../components/manuscript/EntityLegend';
import NotesPanel from '../components/manuscript/NotesPanel';
import StudyNotes from '../components/manuscript/StudyNotes';
import FlashcardStack from '../components/manuscript/FlashcardStack';
import { useLecture } from '../hooks/useLecture';

export default function LectureDetailPage() {
  const { id } = useParams();
  const { lecture, loading, error } = useLecture(id);
  const [activeSpan, setActiveSpan] = useState(null);

  if (loading) {
    return (
      <PageShell wide>
        <LoadingSpinner label="Loading lecture…" />
      </PageShell>
    );
  }

  if (error || !lecture) {
    return (
      <PageShell wide>
        <ErrorBanner message={error || 'Lecture not found.'} />
      </PageShell>
    );
  }

  return (
    <PageShell wide>
      <p className="label-mono mb-2">{lecture.subject || lecture.category}</p>
      <h1 className="font-display text-3xl font-semibold">{lecture.title}</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr),minmax(280px,1fr)]">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="label-mono">raw transcript</p>
              <EntityLegend />
            </div>
            <AnnotatedTranscript
              text={lecture.rawTranscript || lecture.transcript}
              entitySpans={lecture.entitySpans}
              keyTermSpans={lecture.keyTermSpans}
              activeSpanKey={activeSpan?.key}
              onSelectSpan={setActiveSpan}
            />
          </Card>

          <StudyNotes detailedNotes={lecture.detailedNotes} />

          <FlashcardStack flashcards={lecture.flashcards} />
        </div>

        <div className="flex flex-col gap-6">
          <MarginNote span={activeSpan} definitions={lecture.definitions} />
          <NotesPanel lecture={lecture} />
        </div>
      </div>
    </PageShell>
  );
}
