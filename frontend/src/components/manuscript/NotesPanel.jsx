import Card from '../common/Card';
import Tag from '../common/Tag';
import TopicChips from './TopicChips';

const SENTIMENT_TONE = { positive: 'teal', neutral: 'neutral', critical: 'rose', mixed: 'amber' };

export default function NotesPanel({ lecture }) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="label-mono">summary</p>
          <div className="flex items-center gap-2">
            <Tag tone={SENTIMENT_TONE[lecture.sentiment] || 'neutral'}>{lecture.sentiment}</Tag>
            <Tag tone="neutral">{lecture.enrichment === 'gemini' ? 'nlp + gemini' : 'nlp pipeline'}</Tag>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{lecture.summary}</p>
      </Card>

      {lecture.keyPoints?.length > 0 && (
        <Card className="p-5">
          <p className="label-mono mb-3">key points</p>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-ink">
            {lecture.keyPoints.map((point, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={i} className="flex gap-2">
                <span className="text-amber">·</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {lecture.definitions?.length > 0 && (
        <Card className="p-5">
          <p className="label-mono mb-3">definitions</p>
          <dl className="flex flex-col gap-3 text-sm">
            {lecture.definitions.map((def, i) => {
              const [term, ...rest] = def.split(':');
              // eslint-disable-next-line react/no-array-index-key
              return (
                <div key={i}>
                  <dt className="font-display font-medium text-ink">{term.trim()}</dt>
                  <dd className="text-ink-muted">{rest.join(':').trim()}</dd>
                </div>
              );
            })}
          </dl>
        </Card>
      )}

      {(lecture.examTopics?.length > 0 || lecture.topics?.length > 0) && (
        <Card className="p-5">
          {lecture.examTopics?.length > 0 && (
            <div className="mb-4">
              <p className="label-mono mb-3">exam topics</p>
              <TopicChips topics={lecture.examTopics} tone="rose" />
            </div>
          )}
          {lecture.topics?.length > 0 && (
            <div>
              <p className="label-mono mb-3">topics</p>
              <TopicChips topics={lecture.topics} tone="teal" />
            </div>
          )}
        </Card>
      )}

      {typeof lecture.readabilityScore === 'number' && (
        <Card className="p-5">
          <p className="label-mono mb-2">readability</p>
          <p className="text-sm text-ink-muted">
            Flesch-Kincaid grade level <span className="font-mono text-ink">{lecture.readabilityScore.toFixed(1)}</span>
          </p>
        </Card>
      )}
    </div>
  );
}
