import Card from '../common/Card';

/**
 * Renders the pipeline's detailed, sectioned study notes as readable prose.
 * dir="auto" lets the browser lay out Urdu (RTL) section bodies correctly
 * while English sections stay LTR — code-mixed content picks per-paragraph.
 */
export default function StudyNotes({ detailedNotes }) {
  if (!detailedNotes || detailedNotes.length === 0) return null;

  return (
    <Card className="p-5">
      <p className="label-mono mb-4">study notes</p>
      <div className="flex flex-col gap-5">
        {detailedNotes.map((section, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <section key={i}>
            <h3 dir="auto" className="font-display text-lg font-medium text-ink">
              {section.heading}
            </h3>
            <div className="mt-1.5 border-l-2 border-amber-light pl-3">
              {section.body.split('\n').map((para, j) => (
                // eslint-disable-next-line react/no-array-index-key
                <p key={j} dir="auto" className="urdu-capable text-sm leading-relaxed text-ink [&:not(:first-child)]:mt-2">
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Card>
  );
}
