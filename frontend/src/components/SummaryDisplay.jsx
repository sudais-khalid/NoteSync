import React, { useState } from 'react';

const sentimentConfig = {
  positive: { label: 'Positive', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  neutral:  { label: 'Neutral',  bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200' },
  critical: { label: 'Critical', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  mixed:    { label: 'Mixed',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
};

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-claude-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-claude-bg hover:bg-claude-border transition text-left">
        <span className="text-sm font-semibold text-claude-dark">{title}</span>
        <svg className={`w-4 h-4 text-claude-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 py-3 bg-white">{children}</div>}
    </div>
  );
};

const SummaryDisplay = ({ summary, onSave, isSaving }) => {
  if (!summary) {
    return (
      <div className="bg-white rounded-xl border border-claude-border h-full flex items-center justify-center">
        <div className="text-center text-claude-muted p-8">
          <svg className="w-10 h-10 mx-auto mb-3 text-claude-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium mb-1">Notes will appear here</p>
          <p className="text-xs text-claude-subtle">Click Summarize after recording to generate AI notes</p>
        </div>
      </div>
    );
  }

  const sentiment = sentimentConfig[summary.sentiment] || sentimentConfig.neutral;
  const readability = summary.readabilityScore;

  return (
    <div className="bg-white rounded-xl border border-claude-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-claude-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-claude-orange-light flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-claude-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-claude-dark">AI Notes</h2>
          {/* NLP badges */}
          <div className="flex items-center gap-1.5 ml-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sentiment.bg} ${sentiment.text} ${sentiment.border}`}>
              {sentiment.label}
            </span>
            {readability && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-claude-bg text-claude-muted border-claude-border">
                Grade {readability}
              </span>
            )}
          </div>
        </div>
        <button onClick={onSave} disabled={isSaving}
          className="bg-claude-orange hover:bg-claude-orange-dark disabled:bg-claude-border disabled:cursor-not-allowed text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg transition flex items-center gap-1.5">
          {isSaving ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Lecture
            </>
          )}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 p-4 space-y-3 max-h-[600px]">

        {/* Summary */}
        {summary.summary && (
          <Section title="Summary">
            <p className="text-sm text-claude-dark leading-relaxed whitespace-pre-wrap">{summary.summary}</p>
          </Section>
        )}

        {/* Topic Clusters */}
        {summary.topics && summary.topics.length > 0 && (
          <Section title="Topic Clusters">
            <div className="flex flex-wrap gap-2">
              {summary.topics.map((topic, i) => (
                <span key={i} className="text-xs bg-claude-orange-light text-claude-orange border border-orange-200 px-2.5 py-1 rounded-full font-medium">
                  {topic}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Key Points */}
        {summary.keyPoints && summary.keyPoints.length > 0 && (
          <Section title="Key Points">
            <ul className="space-y-1.5">
              {summary.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-claude-dark">
                  <span className="text-claude-orange font-bold mt-0.5 flex-shrink-0">–</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Named Entities */}
        {summary.entities && summary.entities.length > 0 && (
          <Section title="Named Entities" defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {summary.entities.map((e, i) => (
                <span key={i} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full">
                  {e}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Definitions */}
        {summary.definitions && summary.definitions.length > 0 && (
          <Section title="Definitions" defaultOpen={false}>
            <ul className="space-y-1.5">
              {summary.definitions.map((def, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-claude-dark">
                  <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">–</span>
                  <span>{def}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Exam Topics */}
        {summary.examTopics && summary.examTopics.length > 0 && (
          <Section title="Exam-Relevant Topics" defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {summary.examTopics.map((t, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Flashcards */}
        {summary.flashcards && summary.flashcards.length > 0 && (
          <Section title={`Flashcards (${summary.flashcards.length})`} defaultOpen={false}>
            <div className="space-y-2.5">
              {summary.flashcards.map((fc, i) => (
                <div key={i} className="border border-claude-border rounded-lg overflow-hidden text-sm">
                  <div className="bg-claude-bg px-3 py-2 font-medium text-claude-dark border-b border-claude-border">
                    Q: {fc.question}
                  </div>
                  <div className="px-3 py-2 text-claude-muted">
                    A: {fc.answer}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <p className="text-xs text-claude-subtle text-center pt-1 pb-2">
          Click Save Lecture to store these notes for future reference
        </p>
      </div>
    </div>
  );
};

export default SummaryDisplay;