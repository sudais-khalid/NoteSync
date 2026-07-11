import Card from '../common/Card';

export default function LiveTranscriptPanel({ finalText, interimText, editable, onChange }) {
  if (editable) {
    return (
      <Card className="p-5">
        <p className="label-mono mb-2">transcript</p>
        <textarea
          value={finalText}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          className="w-full resize-y rounded-sm border border-hairline bg-paper px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-teal"
          placeholder="Speak, or paste/type a transcript here…"
        />
      </Card>
    );
  }

  return (
    <Card className="min-h-[240px] p-5">
      <p className="label-mono mb-2">live transcript</p>
      <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-ink">
        {finalText}
        <span className="text-ink-faint">{interimText}</span>
        {!finalText && !interimText && <span className="text-ink-faint">Press record and start speaking…</span>}
      </p>
    </Card>
  );
}
