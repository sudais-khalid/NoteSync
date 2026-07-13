import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Tag from '../components/common/Tag';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageShell wide>
      <div className="grid gap-10 py-10 md:grid-cols-[1.1fr,0.9fr] md:items-center">
        <div>
          <p className="label-mono mb-4">record → transcribe → annotate</p>
          <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
            Your lecture, kept exactly as spoken,
            <br /> and marked up like a scholar's notes.
          </h1>
          <p className="mt-5 max-w-md text-ink-muted">
            NoteSync transcribes a lecture live, then runs it through an NLP pipeline that
            highlights key terms and entities right in the raw transcript, alongside a
            generated summary, definitions, and exam-ready flashcards.
          </p>
          <div className="mt-8 flex gap-3">
            <Button variant="amber" className="px-6 py-3 text-base" onClick={() => navigate('/register')}>
              Get started
            </Button>
            <Button variant="outline" className="px-6 py-3 text-base" onClick={() => navigate('/login')}>
              Log in
            </Button>
          </div>
        </div>

        <Card className="p-6 font-mono text-sm leading-relaxed">
          <p className="label-mono mb-3">excerpt · sample transcript</p>
          <p className="text-ink">
            Newton discovered that this <mark className="rounded-none bg-teal-light px-0.5 text-teal-dark decoration-teal underline decoration-dotted">force</mark>{' '}
            follows an inverse square <mark className="rounded-none bg-amber-light px-0.5 text-amber-dark">law</mark>, meaning it weakens as
            distance increases.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Tag tone="teal">entity · Newton</Tag>
            <Tag tone="amber">key term · inverse square</Tag>
            <Tag tone="rose">exam topic</Tag>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
