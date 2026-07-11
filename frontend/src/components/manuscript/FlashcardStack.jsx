import { useState } from 'react';

const TILTS = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0'];

function Flashcard({ card, index }) {
  const [flipped, setFlipped] = useState(false);
  const tilt = TILTS[index % TILTS.length];

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className={`flex min-h-[140px] flex-col justify-between rounded-sm border border-hairline bg-paper-raised p-4 text-left shadow-index transition-transform hover:-translate-y-0.5 ${tilt}`}
    >
      <p className="label-mono">{flipped ? 'answer' : 'question'} · card {index + 1}</p>
      <p className="mt-2 font-display text-base leading-snug text-ink">
        {flipped ? card.answer : card.question}
      </p>
      <p className="mt-3 text-right text-xs text-ink-faint">tap to {flipped ? 'flip back' : 'reveal'}</p>
    </button>
  );
}

export default function FlashcardStack({ flashcards }) {
  if (!flashcards || flashcards.length === 0) return null;

  return (
    <div>
      <p className="label-mono mb-3">flashcards</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((card, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Flashcard key={i} card={card} index={i} />
        ))}
      </div>
    </div>
  );
}
