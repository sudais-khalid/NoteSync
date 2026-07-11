import Tag from '../common/Tag';

export default function TopicChips({ topics, tone = 'teal' }) {
  if (!topics || topics.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <Tag key={topic} tone={tone}>{topic}</Tag>
      ))}
    </div>
  );
}
